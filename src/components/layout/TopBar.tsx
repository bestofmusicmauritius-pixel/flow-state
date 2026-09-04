import clsx from "clsx";
import { ProjectSwitcher } from "@/components/project/ProjectSwitcher";
import { BackupControls } from "@/components/layout/BackupControls";
import { NotificationControls } from "@/components/layout/NotificationControls";

export type View = "board" | "agenda";

interface TopBarProps {
  view: View;
  onChangeView: (view: View) => void;
}

export function TopBar({ view, onChangeView }: TopBarProps) {
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
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => onChangeView("board")}
            className={clsx(
              "px-1.5 py-1 rounded-sm transition-colors",
              view === "board"
                ? "text-text-primary bg-bg-card"
                : "text-text-faint hover:text-text-muted"
            )}
          >
            [board]
          </button>
          <button
            type="button"
            onClick={() => onChangeView("agenda")}
            className={clsx(
              "px-1.5 py-1 rounded-sm transition-colors",
              view === "agenda"
                ? "text-text-primary bg-bg-card"
                : "text-text-faint hover:text-text-muted"
            )}
          >
            [agenda]
          </button>
        </div>
        <NotificationControls />
        <BackupControls />
      </div>
    </header>
  );
}
