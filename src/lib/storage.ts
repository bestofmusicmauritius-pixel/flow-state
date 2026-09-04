import { seedState } from "@/lib/seed";
import type { AppState, Project } from "@/types";

const APP_STATE_KEY = "flow-state:app-state:v1";

export interface DataStore {
  load(): AppState;
  save(state: AppState): void;
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    Array.isArray(p.cards) &&
    Array.isArray(p.todos) &&
    typeof p.notes === "string"
  );
}

export function isValidAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const s = value as Record<string, unknown>;
  return (
    Array.isArray(s.projects) &&
    s.projects.every(isProject) &&
    (s.activeProjectId === null || typeof s.activeProjectId === "string")
  );
}

export const localStorageStore: DataStore = {
  load() {
    if (typeof window === "undefined") return seedState();
    try {
      const raw = window.localStorage.getItem(APP_STATE_KEY);
      if (!raw) return seedState();
      const parsed = JSON.parse(raw);
      if (!isValidAppState(parsed)) return seedState();
      return parsed;
    } catch {
      return seedState();
    }
  },
  save(state) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
    } catch {
      // localStorage unavailable or quota exceeded — fail silently, in-memory state still works
    }
  },
};
