"use client";

import { useRef, useState } from "react";
import { useAppStateContext } from "@/context/AppStateContext";
import { isTrelloBoard, importTrelloBoard } from "@/lib/importers/trello";
import { isTodoistCsv, importTodoistCsv } from "@/lib/importers/todoist";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Project } from "@/types";

interface PendingImport {
  source: "trello" | "todoist";
  project: Project;
}

export function ImportControls() {
  const { importProject } = useAppStateContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    file
      .text()
      .then((text) => {
        let parsedJson: unknown = null;
        try {
          parsedJson = JSON.parse(text);
        } catch {
          // not JSON — fall through to the CSV check below
        }

        if (parsedJson && isTrelloBoard(parsedJson)) {
          setPending({ source: "trello", project: importTrelloBoard(parsedJson) });
          return;
        }

        if (isTodoistCsv(text)) {
          const name = file.name.replace(/\.csv$/i, "").trim() || "Imported from Todoist";
          setPending({ source: "todoist", project: importTodoistCsv(text, name) });
          return;
        }

        setError("doesn't look like a Trello board export (.json) or Todoist project export (.csv)");
      })
      .catch(() => setError("couldn't read that file"));
  }

  const summary = pending
    ? pending.source === "trello"
      ? `${pending.project.cards.length} card${pending.project.cards.length === 1 ? "" : "s"}${
          pending.project.archivedCards.length
            ? ` (plus ${pending.project.archivedCards.length} archived)`
            : ""
        }`
      : `${pending.project.todos.length} task${pending.project.todos.length === 1 ? "" : "s"}`
    : "";

  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      {error && <span className="text-alert mr-1">{error}</span>}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-1.5 py-1 rounded-sm text-text-faint hover:text-text-primary hover:bg-bg-card transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        [import from trello/todoist]
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json,.csv,text/csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <ConfirmDialog
        open={pending !== null}
        title={pending?.source === "trello" ? "Import Trello Board" : "Import Todoist Project"}
        message={
          pending
            ? `Create a new project "${pending.project.name}" with ${summary} from this file?`
            : ""
        }
        confirmLabel="Import"
        onConfirm={() => {
          if (pending) importProject(pending.project);
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
