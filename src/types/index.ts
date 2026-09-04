export type ColumnId = "todo" | "in-progress" | "complete";

export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "todo" },
  { id: "in-progress", title: "in progress" },
  { id: "complete", title: "complete" },
];

export type Priority = "p0" | "p1" | "p2" | "p3";

export const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "p0", label: "critical" },
  { id: "p1", label: "high" },
  { id: "p2", label: "medium" },
  { id: "p3", label: "low" },
];

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  column: ColumnId;
  order: number;
  priority?: Priority;
  dueDate?: string;
  dueTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  order: number;
  priority?: Priority;
  dueDate?: string;
  dueTime?: string;
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
