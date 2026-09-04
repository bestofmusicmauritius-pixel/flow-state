export type SearchMode = "all" | "any";

export interface ParsedQuery {
  must: string[];
  should: string[];
  mustNot: string[];
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

  const tokenRegex = /"([^"]+)"|(\S+)/g;
  const rawTokens: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(raw))) {
    rawTokens.push((match[1] ?? match[2]).toLowerCase());
  }

  let lastPlain: { list: string[]; index: number } | null = null;
  let pendingOr = false;

  for (let i = 0; i < rawTokens.length; i++) {
    let token = rawTokens[i];

    if (token === "or") {
      if (lastPlain && lastPlain.list !== should) {
        const [term] = lastPlain.list.splice(lastPlain.index, 1);
        should.push(term);
      }
      pendingOr = true;
      lastPlain = null;
      continue;
    }
    if (token === "and") {
      pendingOr = false;
      lastPlain = null;
      continue;
    }

    let negate = false;
    if (token === "not") {
      i++;
      token = rawTokens[i];
      if (token === undefined) break;
      negate = true;
    } else if (token.startsWith("-") && token.length > 1) {
      negate = true;
      token = token.slice(1);
    }

    if (negate) {
      mustNot.push(token);
      pendingOr = false;
      lastPlain = null;
      continue;
    }

    if (pendingOr) {
      should.push(token);
      lastPlain = { list: should, index: should.length - 1 };
      pendingOr = false;
    } else if (mode === "any") {
      should.push(token);
      lastPlain = { list: should, index: should.length - 1 };
    } else {
      must.push(token);
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
