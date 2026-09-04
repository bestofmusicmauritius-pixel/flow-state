export type DueUrgency =
  | "overdue"
  | "today"
  | "tomorrow"
  | "week"
  | "twoWeeks"
  | "month"
  | "later";

function toLocalMidnight(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Whole days between today and dueDate (negative if in the past). Both dates
 * are compared at local midnight, so this is immune to time-of-day/timezone
 * drift even though dueDate itself is a plain "YYYY-MM-DD" string. */
function daysUntil(dueDate: string): number {
  const due = toLocalMidnight(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

/** The exact instant a due date/time is reached. Without a time, that's the
 * end of the due day — so a date-only item stays "today" all day and only
 * flips to overdue after midnight, rather than the moment the page loads. */
export function getDueTimestamp(dueDate: string, dueTime?: string): number {
  const [y, m, d] = dueDate.split("-").map(Number);
  if (dueTime) {
    const [hh, mm] = dueTime.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm).getTime();
  }
  return new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
}

/** isDone marks a completed card/todo — its due date no longer matters, so it
 * never reads as overdue or urgent. */
export function getDueUrgency(dueDate: string, dueTime: string | undefined, isDone: boolean): DueUrgency {
  if (isDone) return "later";

  if (getDueTimestamp(dueDate, dueTime) <= Date.now()) return "overdue";

  const diff = daysUntil(dueDate);
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff <= 7) return "week";
  if (diff <= 14) return "twoWeeks";
  if (diff <= 30) return "month";
  return "later";
}

/** "2026-09-10" alone, or "2026-09-10 3:00pm" when a time is set. */
export function formatDueDateTime(dueDate: string, dueTime?: string): string {
  if (!dueTime) return dueDate;
  const [hh, mm] = dueTime.split(":").map(Number);
  const period = hh >= 12 ? "pm" : "am";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${dueDate} ${hour12}:${String(mm).padStart(2, "0")}${period}`;
}

// A hot-to-cold gradient: overdue/today are the reserved alert-red and a hot
// orange, then the sweep cools as urgency drops — see globals.css for why
// this is the one place hue (not just brightness) carries meaning.
export const DUE_COLOR: Record<DueUrgency, string> = {
  overdue: "text-alert",
  today: "text-due-today",
  tomorrow: "text-due-tomorrow",
  week: "text-due-week",
  twoWeeks: "text-due-two-weeks",
  month: "text-due-month",
  later: "text-due-later",
};

export const DUE_LABEL: Record<DueUrgency, string> = {
  overdue: "overdue",
  today: "due today",
  tomorrow: "due tomorrow",
  week: "due this week",
  twoWeeks: "due in 2 weeks",
  month: "due this month",
  later: "due",
};

/** Soonest due date/time first; undated items sort last. */
export function compareByDueDate(
  a: { dueDate?: string; dueTime?: string },
  b: { dueDate?: string; dueTime?: string }
): number {
  const aKey = a.dueDate ? getDueTimestamp(a.dueDate, a.dueTime) : Infinity;
  const bKey = b.dueDate ? getDueTimestamp(b.dueDate, b.dueTime) : Infinity;
  return aKey - bKey;
}
