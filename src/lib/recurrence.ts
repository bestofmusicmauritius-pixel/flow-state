import type { Recurrence } from "@/types";

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** The next occurrence of a "YYYY-MM-DD" due date under a recurrence rule. */
export function nextDueDate(dueDate: string, recurrence: Recurrence): string {
  const [y, m, d] = dueDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (recurrence === "daily") date.setDate(date.getDate() + 1);
  else if (recurrence === "weekly") date.setDate(date.getDate() + 7);
  else if (recurrence === "monthly") date.setMonth(date.getMonth() + 1);
  return toISODate(date);
}
