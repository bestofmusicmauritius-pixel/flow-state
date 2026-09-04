"use client";

import clsx from "clsx";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TodoList } from "@/components/todos/TodoList";
import { NotesPanel } from "@/components/notes/NotesPanel";

export function Sidebar() {
  const [collapsed, setCollapsed] = useLocalStorage("flow-state:sidebar-collapsed", false);

  if (collapsed) {
    return (
      <div className="w-10 shrink-0 bg-bg-elevated border-l border-border flex flex-col items-center py-3">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          className="font-mono text-xs text-text-faint hover:text-accent [writing-mode:vertical-rl] rotate-180 py-2"
        >
          {"// todo notes"}
        </button>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "w-80 shrink-0 bg-bg-elevated border-l border-border flex flex-col min-h-0"
      )}
    >
      <div className="flex items-center justify-end px-2 pt-2">
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
          className="font-mono text-xs text-text-faint hover:text-accent px-1"
        >
          »
        </button>
      </div>
      <div className="flex flex-col min-h-0 flex-1">
        <div className="basis-2/5 min-h-0 flex flex-col border-b border-border">
          <TodoList />
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <NotesPanel />
        </div>
      </div>
    </div>
  );
}
