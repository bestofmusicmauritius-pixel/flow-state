"use client";

import { useRef, useState } from "react";
import { useAppStateContext } from "@/context/AppStateContext";
import { isValidAppState } from "@/lib/storage";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { AppState } from "@/types";

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function BackupControls({ showExport = true }: { showExport?: boolean }) {
  const { state, replaceState } = useAppStateContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(state, `flow-state-backup-${date}.json`);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    file
      .text()
      .then((text) => {
        const parsed = JSON.parse(text);
        if (!isValidAppState(parsed)) {
          setError("that file doesn't look like a flow-state backup");
          return;
        }
        setPendingImport(parsed);
      })
      .catch(() => setError("couldn't read that file as json"));
  }

  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      {error && <span className="text-alert mr-1">{error}</span>}
      {showExport && (
        <button
          type="button"
          onClick={handleExport}
          className="px-1.5 py-1 rounded-sm text-text-faint hover:text-text-primary hover:bg-bg-card transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
          [export]
        </button>
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-1.5 py-1 rounded-sm text-text-faint hover:text-text-primary hover:bg-bg-card transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        [import]
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      <ConfirmDialog
        open={pendingImport !== null}
        title="Restore Backup"
        message="This replaces every project, task, todo, and note currently stored with the contents of this file. This cannot be undone."
        confirmLabel="Restore"
        onConfirm={() => {
          if (pendingImport) replaceState(pendingImport);
          setPendingImport(null);
        }}
        onCancel={() => setPendingImport(null)}
      />
    </div>
  );
}
