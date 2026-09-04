import { seedState } from "@/lib/seed";
import type { AppState } from "@/types";

const APP_STATE_KEY = "flow-state:app-state:v1";

export interface DataStore {
  load(): AppState;
  save(state: AppState): void;
}

export const localStorageStore: DataStore = {
  load() {
    if (typeof window === "undefined") return seedState();
    try {
      const raw = window.localStorage.getItem(APP_STATE_KEY);
      if (!raw) return seedState();
      const parsed = JSON.parse(raw) as AppState;
      if (!parsed || !Array.isArray(parsed.projects)) return seedState();
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
