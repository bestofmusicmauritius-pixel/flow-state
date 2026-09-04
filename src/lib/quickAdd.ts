import { normalizeTag } from "@/lib/tags";
import type { Priority } from "@/types";

export interface QuickAddResult {
  title: string;
  tags: string[];
  priority: Priority | null;
  dueDate: string | null;
}

const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** The next occurrence of a weekday (strictly in the future — "@mon" typed
 * on a Monday means next Monday, not today), or null if not a weekday name. */
function nextWeekday(name: string): string | null {
  const idx = WEEKDAYS.indexOf(name.slice(0, 3).toLowerCase());
  if (idx === -1) return null;
  const now = new Date();
  let diff = idx - now.getDay();
  if (diff <= 0) diff += 7;
  return toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff));
}

function resolveDueDate(token: string): string | null {
  const value = token.toLowerCase();
  if (value === "today") return toISODate(new Date());
  if (value === "tomorrow") {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toISODate(d);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return nextWeekday(value);
}

/**
 * A small, deliberately non-natural-language quick-add syntax: one prefix
 * per field, so parsing is exact instead of guessing at intent.
 *   #tag           — repeatable, normalized the same way the tag editor does
 *   !p0 .. !p3     — priority (first one found wins)
 *   @today / @tomorrow / @mon.."@sun" / @YYYY-MM-DD — due date
 * Everything else becomes the title. An unrecognized @token (e.g. a typo)
 * is left as plain title text rather than silently dropped.
 */
export function parseQuickAdd(raw: string): QuickAddResult {
  const titleParts: string[] = [];
  const tags: string[] = [];
  let priority: Priority | null = null;
  let dueDate: string | null = null;

  for (const token of raw.split(/\s+/).filter(Boolean)) {
    if (token.startsWith("#") && token.length > 1) {
      const tag = normalizeTag(token);
      if (tag) tags.push(tag);
      continue;
    }

    if (/^!p[0-3]$/i.test(token)) {
      if (!priority) priority = token.slice(1).toLowerCase() as Priority;
      continue;
    }

    if (token.startsWith("@") && token.length > 1) {
      const resolved = resolveDueDate(token.slice(1));
      if (resolved) {
        if (!dueDate) dueDate = resolved;
        continue;
      }
    }

    titleParts.push(token);
  }

  return {
    title: titleParts.join(" ").trim(),
    tags: [...new Set(tags)],
    priority,
    dueDate,
  };
}
