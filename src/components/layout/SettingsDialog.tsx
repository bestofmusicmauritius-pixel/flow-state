"use client";

import { Dialog } from "@/components/ui/Dialog";
import { NotificationControls } from "@/components/layout/NotificationControls";
import { BackupControls } from "@/components/layout/BackupControls";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Settings">
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-mono text-xs text-text-faint mb-1.5">{"// notifications"}</p>
          <NotificationControls />
        </div>
        <div>
          <p className="font-mono text-xs text-text-faint mb-1.5">{"// backup"}</p>
          <BackupControls />
        </div>
      </div>
    </Dialog>
  );
}
