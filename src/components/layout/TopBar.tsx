import { ProjectSwitcher } from "@/components/project/ProjectSwitcher";

export function TopBar() {
  return (
    <header className="h-12 shrink-0 bg-bg-elevated border-b border-border px-4 flex items-center">
      <div className="flex items-center gap-1 font-mono text-sm">
        <span className="text-text-faint">~/flow-state/</span>
        <ProjectSwitcher />
        <span aria-hidden="true" className="cursor-blink text-accent -ml-1">
          █
        </span>
      </div>
    </header>
  );
}
