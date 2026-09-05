import { createId } from "@/lib/id";
import { createEmptyProject } from "@/lib/seed";
import { normalizeTag } from "@/lib/tags";
import type { ColumnId, KanbanCard, Project } from "@/types";

interface TrelloLabel {
  name?: string;
}

interface TrelloCard {
  id: string;
  name: string;
  desc?: string;
  idList: string;
  closed?: boolean;
  due?: string | null;
  labels?: TrelloLabel[];
}

interface TrelloList {
  id: string;
  name: string;
}

interface TrelloBoard {
  name?: string;
  lists?: TrelloList[];
  cards?: TrelloCard[];
}

export function isTrelloBoard(data: unknown): data is TrelloBoard {
  if (typeof data !== "object" || data === null) return false;
  const board = data as TrelloBoard;
  return Array.isArray(board.lists) && Array.isArray(board.cards);
}

/** Trello lists have no notion of "kanban column" — guess from the list name,
 * falling back to todo for anything that doesn't look like doing/done. */
function guessColumn(listName: string): ColumnId {
  const n = listName.toLowerCase();
  if (/(done|complete|finished|shipped|closed)/.test(n)) return "complete";
  if (/(doing|progress|active|review|wip|working)/.test(n)) return "in-progress";
  return "todo";
}

/** Trello's `due` is a UTC ISO timestamp; split into the local date/time
 * strings flow-state stores due dates as (see lib/dueDate.ts). */
function splitDueIso(iso: string): { dueDate: string; dueTime: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dueDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    dueTime: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

/** Imports a Trello board export (Board menu -> Print, export, and share ->
 * Export as JSON) into a new flow-state project. Archived (closed) cards
 * land in the archive rather than being dropped, since flow-state has one. */
export function importTrelloBoard(board: TrelloBoard): Project {
  const listColumns = new Map<string, ColumnId>();
  for (const list of board.lists ?? []) {
    listColumns.set(list.id, guessColumn(list.name));
  }

  const project = createEmptyProject(board.name?.trim() || "Imported from Trello");
  const now = new Date().toISOString();
  const nextOrder: Record<ColumnId, number> = { todo: 0, "in-progress": 0, complete: 0 };
  const cards: KanbanCard[] = [];
  const archivedCards: KanbanCard[] = [];

  for (const card of board.cards ?? []) {
    const column = listColumns.get(card.idList) ?? "todo";
    const tags = [
      ...new Set(
        (card.labels ?? [])
          .map((l) => l.name?.trim())
          .filter((name): name is string => Boolean(name))
          .map(normalizeTag)
      ),
    ];
    const due = card.due ? splitDueIso(card.due) : null;

    const kanbanCard: KanbanCard = {
      id: createId(),
      title: card.name?.trim() || "Untitled",
      description: card.desc?.trim() || undefined,
      column,
      order: nextOrder[column]++,
      dueDate: due?.dueDate,
      dueTime: due?.dueTime,
      tags: tags.length ? tags : undefined,
      createdAt: now,
      updatedAt: now,
    };

    if (card.closed) {
      archivedCards.push({ ...kanbanCard, archivedAt: now });
    } else {
      cards.push(kanbanCard);
    }
  }

  return { ...project, cards, archivedCards };
}
