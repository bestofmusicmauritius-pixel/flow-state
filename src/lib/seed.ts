import { createId } from "@/lib/id";
import type { AppState, Project } from "@/types";

export function createEmptyProject(name: string): Project {
  const now = new Date().toISOString();
  return {
    id: createId(),
    name,
    createdAt: now,
    updatedAt: now,
    cards: [],
    archivedCards: [],
    todos: [],
    notes: "",
  };
}

export function seedState(): AppState {
  return { projects: [], activeProjectId: null };
}
