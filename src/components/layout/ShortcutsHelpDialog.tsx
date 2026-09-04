"use client";

import { Dialog } from "@/components/ui/Dialog";

const SHORTCUTS: { key: string; description: string }[] = [
  { key: "/", description: "jump to search" },
  { key: "b", description: "board view" },
  { key: "a", description: "agenda view" },
  { key: "n", description: "new task (on the board view)" },
  { key: "?", description: "show this help" },
  { key: "esc", description: "close a dialog" },
];

interface ShortcutsHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsHelpDialog({ open, onClose }: ShortcutsHelpDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Keyboard Shortcuts">
      <div className="flex flex-col gap-1.5">
        {SHORTCUTS.map((s) => (
          <div key={s.key} className="flex items-center gap-3 font-mono text-sm">
            <span className="w-10 shrink-0 text-accent">{s.key}</span>
            <span className="text-text-muted">{s.description}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 font-mono text-xs text-text-faint">
        {"// shortcuts are ignored while typing in a field"}
      </p>
    </Dialog>
  );
}
