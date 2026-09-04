"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

export interface PaletteAction {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  actions: PaletteAction[];
}

export function CommandPalette({ open, onClose, actions }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) => a.label.toLowerCase().includes(q) || a.hint?.toLowerCase().includes(q)
    );
  }, [actions, query]);

  if (!open) return null;

  function run(action: PaletteAction) {
    action.run();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg-overlay backdrop-blur-[2px] pt-[15vh] p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-bg-elevated border border-accent/40 rounded-lg shadow-[0_0_24px_rgba(255,181,69,0.12)] overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
          <span className="text-accent font-mono text-sm">{">"}</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onClose();
                return;
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelected((s) => Math.min(s + 1, Math.max(filtered.length - 1, 0)));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelected((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const action = filtered[selected];
                if (action) run(action);
              }
            }}
            placeholder="type a command..."
            className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-text-primary placeholder:text-text-faint"
          />
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="font-mono text-xs text-text-faint text-center py-4">
              $ no matching commands
            </p>
          ) : (
            filtered.map((action, i) => (
              <button
                key={action.id}
                type="button"
                onMouseEnter={() => setSelected(i)}
                onClick={() => run(action)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-1.5 font-mono text-sm text-left transition-colors",
                  i === selected ? "bg-bg-card text-text-primary" : "text-text-muted"
                )}
              >
                <span>{action.label}</span>
                {action.hint && <span className="text-text-faint text-xs">{action.hint}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
