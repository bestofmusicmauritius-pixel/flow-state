import { normalizeTag } from "@/lib/tags";
import type { Priority } from "@/types";

export interface QuickAddResult {
  title: string;
  tags: string[];
  priority: Priority | null;
  dueDate: string | null;
  dueTime: string | null;
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

function resolveDueDate(value: string): string | null {
  const lower = value.toLowerCase();
  if (lower === "today") return toISODate(new Date());
  if (lower === "tomorrow") {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toISODate(d);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(lower)) return lower;
  return nextWeekday(lower);
}

/** "9am", "9:30am", "9pm", "14:30" — all normalize to a 24-hour "HH:MM". */
function resolveTime(value: string): string | null {
  const lower = value.toLowerCase();

  const twelveHour = lower.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)$/);
  if (twelveHour) {
    const rawHour = Number(twelveHour[1]);
    const minute = twelveHour[2] ? Number(twelveHour[2]) : 0;
    if (rawHour < 1 || rawHour > 12 || minute > 59) return null;
    const isPM = twelveHour[3] === "pm";
    const hour = isPM ? (rawHour === 12 ? 12 : rawHour + 12) : rawHour === 12 ? 0 : rawHour;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  const twentyFourHour = lower.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = Number(twentyFourHour[2]);
    if (hour > 23 || minute > 59) return null;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  return null;
}

/**
 * Resolves an "@" token to a date, and optionally a time appended after the
 * LAST "-" (e.g. "@tomorrow-9am", "@fri-14:30", "@2026-12-25-9am"). Both the
 * date half and the time half must resolve for the split to be accepted —
 * otherwise this falls back to treating the whole token as a date-only
 * value, which matters because date literals ("2026-12-25") already contain
 * dashes themselves.
 */
function resolveDueToken(value: string): { date: string; time: string | null } | null {
  const lastDash = value.lastIndexOf("-");
  if (lastDash > 0) {
    const datePart = value.slice(0, lastDash);
    const timePart = value.slice(lastDash + 1);
    const date = resolveDueDate(datePart);
    const time = resolveTime(timePart);
    if (date && time) return { date, time };
  }

  const date = resolveDueDate(value);
  return date ? { date, time: null } : null;
}

/**
 * A small, deliberately non-natural-language quick-add syntax: one prefix
 * per field, so parsing is exact instead of guessing at intent.
 *   #tag                  — repeatable, normalized like the tag editor
 *   !p0 .. !p3             — priority (first one found wins)
 *   @today / @tomorrow / @mon.."@sun" / @YYYY-MM-DD — due date
 *   @<date>-<time>         — same, with a time: @tomorrow-9am, @fri-14:30
 * Everything else becomes the title. An unrecognized @token (e.g. a typo)
 * is left as plain title text rather than silently dropped.
 */
export function parseQuickAdd(raw: string): QuickAddResult {
  const titleParts: string[] = [];
  const tags: string[] = [];
  let priority: Priority | null = null;
  let dueDate: string | null = null;
  let dueTime: string | null = null;

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
      const resolved = resolveDueToken(token.slice(1));
      if (resolved) {
        if (!dueDate) {
          dueDate = resolved.date;
          dueTime = resolved.time;
        }
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
    dueTime,
  };
}
