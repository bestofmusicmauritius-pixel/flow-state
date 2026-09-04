"use client";

import { useState } from "react";
import clsx from "clsx";
import { ProjectSwitcher } from "@/components/project/ProjectSwitcher";
import { SettingsDialog } from "@/components/layout/SettingsDialog";

export type View = "board" | "agenda" | "search" | "archive";

const VIEWS: { id: View; label: string }[] = [
  { id: "board", label: "[board]" },
  { id: "agenda", label: "[agenda]" },
  { id: "search", label: "[search]" },
  { id: "archive", label: "[archive]" },
];

interface TopBarProps {
  view: View;
  onChangeView: (view: View) => void;
  onOpenPalette: () => void;
}

export function TopBar({ view, onChangeView, onOpenPalette }: TopBarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="h-12 shrink-0 bg-bg-elevated border-b border-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-1 font-mono text-sm">
        <span className="text-text-faint">~/flow-state/</span>
        <ProjectSwitcher />
        <span aria-hidden="true" className="cursor-blink text-accent -ml-1">
          █
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenPalette}
          title="Command palette"
          className="flex items-center gap-1.5 px-2 py-1 rounded-sm border border-border font-mono text-xs text-text-faint hover:text-text-primary hover:border-border-strong transition-colors"
        >
          <span>command</span>
          <span className="px-1 rounded-sm border border-border-strong text-text-muted">k</span>
        </button>
        <div className="flex items-center gap-1 font-mono text-xs">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onChangeView(v.id)}
              className={clsx(
                "px-1.5 py-1 rounded-sm transition-colors",
                view === v.id
                  ? "text-text-primary bg-bg-card"
                  : "text-text-faint hover:text-text-muted"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="px-1.5 py-1 rounded-sm font-mono text-xs text-text-faint hover:text-text-primary hover:bg-bg-card transition-colors"
        >
          [settings]
        </button>
      </div>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
