export type ColumnId = "todo" | "in-progress" | "complete";

export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "todo" },
  { id: "in-progress", title: "in progress" },
  { id: "complete", title: "complete" },
];

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  column: ColumnId;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  order: number;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  cards: KanbanCard[];
  todos: TodoItem[];
  notes: string;
}

export interface AppState {
  projects: Project[];
  activeProjectId: string | null;
}
