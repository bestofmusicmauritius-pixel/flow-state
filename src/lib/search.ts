export type SearchMode = "all" | "any";

export interface ParsedQuery {
  must: string[];
  should: string[];
  mustNot: string[];
}

interface RawToken {
  text: string;
  quoted: boolean;
}

function tokenize(raw: string): RawToken[] {
  const tokenRegex = /"([^"]+)"|(\S+)/g;
  const tokens: RawToken[] = [];
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(raw))) {
    if (match[1] !== undefined) {
      tokens.push({ text: match[1].toLowerCase(), quoted: true });
    } else {
      tokens.push({ text: match[2].toLowerCase(), quoted: false });
    }
  }
  return tokens;
}

/** Tags are stored and matched without their "#" — it's a display-only
 * prefix (see lib/tags.ts) — so a bare search term gets the same treatment
 * here, or "#test" would fail to find a stored tag "test". Quoted phrases
 * stay literal, so `"#literally-this"` is still possible if ever needed. */
function termOf(token: RawToken): string {
  return token.quoted ? token.text : token.text.replace(/^#+/, "");
}

/**
 * Lightweight boolean query parser: "all words" (default AND) vs "any word"
 * (default OR) sets how plain terms combine, and explicit operators always
 * win over that default — "OR" between two terms, a leading "-" or "NOT"
 * to exclude a term, and "quoted phrases" for exact substrings.
 *
 * "OR" is a binary connector: when it follows a plain term, that term (and
 * the one after "OR") both move into `should`, even if the term was already
 * tentatively classified as `must` under "all words" mode — otherwise
 * "foo OR bar" would incorrectly still require "foo".
 */
export function parseQuery(raw: string, mode: SearchMode): ParsedQuery {
  const must: string[] = [];
  const should: string[] = [];
  const mustNot: string[] = [];

  const rawTokens = tokenize(raw);

  let lastPlain: { list: string[]; index: number } | null = null;
  let pendingOr = false;

  for (let i = 0; i < rawTokens.length; i++) {
    let current = rawTokens[i];

    if (!current.quoted && current.text === "or") {
      if (lastPlain && lastPlain.list !== should) {
        const [term] = lastPlain.list.splice(lastPlain.index, 1);
        should.push(term);
      }
      pendingOr = true;
      lastPlain = null;
      continue;
    }
    if (!current.quoted && current.text === "and") {
      pendingOr = false;
      lastPlain = null;
      continue;
    }

    let negate = false;
    if (!current.quoted && current.text === "not") {
      i++;
      current = rawTokens[i];
      if (current === undefined) break;
      negate = true;
    } else if (!current.quoted && current.text.startsWith("-") && current.text.length > 1) {
      negate = true;
      current = { text: current.text.slice(1), quoted: false };
    }

    const term = termOf(current);
    if (!term) continue;

    if (negate) {
      mustNot.push(term);
      pendingOr = false;
      lastPlain = null;
      continue;
    }

    if (pendingOr) {
      should.push(term);
      lastPlain = { list: should, index: should.length - 1 };
      pendingOr = false;
    } else if (mode === "any") {
      should.push(term);
      lastPlain = { list: should, index: should.length - 1 };
    } else {
      must.push(term);
      lastPlain = { list: must, index: must.length - 1 };
    }
  }

  return { must, should, mustNot };
}

export function matchesQuery(haystack: string, query: ParsedQuery): boolean {
  const text = haystack.toLowerCase();
  if (query.must.some((term) => !text.includes(term))) return false;
  if (query.mustNot.some((term) => text.includes(term))) return false;
  if (query.should.length > 0 && !query.should.some((term) => text.includes(term))) return false;
  return true;
}

/** A short window of text around the first matched term, for showing why a
 * long free-text field (like notes) matched a query. */
export function extractSnippet(text: string, query: ParsedQuery, radius = 40): string {
  const lower = text.toLowerCase();
  let matchIndex = -1;
  for (const term of [...query.must, ...query.should]) {
    const index = lower.indexOf(term);
    if (index !== -1 && (matchIndex === -1 || index < matchIndex)) matchIndex = index;
  }

  if (matchIndex === -1) {
    const head = text.slice(0, radius * 2).trim();
    return text.length > radius * 2 ? `${head}…` : head;
  }

  const start = Math.max(0, matchIndex - radius);
  const end = Math.min(text.length, matchIndex + radius);
  const snippet = text.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${snippet}${end < text.length ? "…" : ""}`;
}
