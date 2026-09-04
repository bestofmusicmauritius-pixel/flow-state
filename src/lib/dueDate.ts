import type { ColumnId } from "@/types";

export type DueUrgency = "overdue" | "today" | "soon" | "later";

function todayISO(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/** dueDate is a "YYYY-MM-DD" string (no time component), so plain string
 * comparison against today's local date is correct and avoids timezone bugs. */
export function getDueUrgency(dueDate: string, column: ColumnId): DueUrgency {
  if (column === "complete") return "later";

  const today = todayISO();
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";

  const soonCutoff = new Date();
  soonCutoff.setDate(soonCutoff.getDate() + 3);
  const soonISO = new Date(soonCutoff.getTime() - soonCutoff.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  return dueDate <= soonISO ? "soon" : "later";
}

// Brightness scales with urgency, the same "brighter = more important" language
// used for priority tags — overdue reuses the alert-red exception.
export const DUE_COLOR: Record<DueUrgency, string> = {
  overdue: "text-alert",
  today: "text-accent",
  soon: "text-text-muted",
  later: "text-text-faint",
};

export const DUE_LABEL: Record<DueUrgency, string> = {
  overdue: "overdue",
  today: "due today",
  soon: "due",
  later: "due",
};
