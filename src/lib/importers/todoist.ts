import { createId } from "@/lib/id";
import { createEmptyProject } from "@/lib/seed";
import type { Priority, Project, TodoItem } from "@/types";

/** RFC4180-ish CSV parser: comma-separated, double-quote quoting, doubled
 * quotes escape a literal quote, quoted fields may contain commas/newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  function pushField() {
    row.push(field);
    field = "";
  }
  function pushRow() {
    pushField();
    rows.push(row);
    row = [];
  }

  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      pushField();
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      pushRow();
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) pushRow();

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

/** Recognizes Todoist's project-backup CSV template (Settings -> Backups,
 * or a project's "Export as CSV"): a header row naming TYPE/CONTENT/etc.,
 * one row per task/section/note. */
export function isTodoistCsv(text: string): boolean {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  return /\bTYPE\b/i.test(firstLine) && /\bCONTENT\b/i.test(firstLine);
}

const PRIORITY_MAP: Record<string, Priority | undefined> = {
  "4": "p0",
  "3": "p1",
  "2": "p2",
};

/** Best-effort — only handles a plain "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM"
 * value in the DATE column. Todoist can also store free-text natural-language
 * dates ("every day", "tomorrow") depending on locale/version; those are left
 * undated rather than guessed at. */
function parseDate(raw: string): { dueDate?: string; dueTime?: string } {
  const match = raw.trim().match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}))?/);
  if (!match) return {};
  return { dueDate: match[1], dueTime: match[2] };
}

/**
 * Imports a Todoist CSV project export into a new flow-state project's todo
 * list — Todoist projects are flat/nested task lists, not boards, so this
 * maps to flow-state's Todo panel rather than the kanban board.
 *
 * Caveat: unlike the Trello importer, this hasn't been verified against a
 * real Todoist export file — it targets the documented CSV template shape.
 * If a real export doesn't parse, that's the likely reason.
 */
export function importTodoistCsv(text: string, projectName: string): Project {
  const rows = parseCsv(text);
  if (rows.length === 0) return createEmptyProject(projectName);

  const header = rows[0].map((h) => h.trim().toUpperCase());
  const typeIdx = header.indexOf("TYPE");
  const contentIdx = header.indexOf("CONTENT");
  const priorityIdx = header.indexOf("PRIORITY");
  const dateIdx = header.indexOf("DATE");

  const project = createEmptyProject(projectName);
  const now = new Date().toISOString();
  const todos: TodoItem[] = [];
  let order = 0;

  for (const row of rows.slice(1)) {
    const type = typeIdx >= 0 ? row[typeIdx]?.trim().toLowerCase() : "task";
    if (type !== "task") continue;
    const content = contentIdx >= 0 ? row[contentIdx]?.trim() : "";
    if (!content) continue;

    const priority = priorityIdx >= 0 ? PRIORITY_MAP[row[priorityIdx]?.trim()] : undefined;
    const { dueDate, dueTime } = dateIdx >= 0 ? parseDate(row[dateIdx] ?? "") : {};

    todos.push({
      id: createId(),
      text: content,
      done: false,
      order: order++,
      priority,
      dueDate,
      dueTime,
      createdAt: now,
    });
  }

  return { ...project, todos };
}
