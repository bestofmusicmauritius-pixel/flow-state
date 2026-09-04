"use client";

import { useState } from "react";
import clsx from "clsx";
import { useAppStateContext } from "@/context/AppStateContext";
import { useToast } from "@/context/ToastContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { PRIORITY_COLOR, PRIORITY_TAG } from "@/lib/priority";
import { COLUMN_BRACKET, type KanbanCard } from "@/types";

interface ArchivedCardRowProps {
  projectId: string;
  projectName?: string;
  card: KanbanCard;
}

export function ArchivedCardRow({ projectId, projectName, card }: ArchivedCardRowProps) {
  const { restoreCard, deleteArchivedCard, undoDeleteArchivedCard } = useAppStateContext();
  const { showToast } = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="flex items-center gap-2 py-1.5 px-1 rounded-sm font-mono text-sm">
      <span className="text-text-faint shrink-0">{COLUMN_BRACKET[card.column]}</span>
      {projectName && (
        <>
          <span className="text-text-faint shrink-0">{projectName}</span>
          <span className="text-text-faint shrink-0">·</span>
        </>
      )}
      {card.priority && (
        <span className={clsx("shrink-0", PRIORITY_COLOR[card.priority])}>
          {PRIORITY_TAG[card.priority]}
        </span>
      )}
      <span className="text-text-muted truncate flex-1">{card.title}</span>
      <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(true)}>
        delete forever
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          restoreCard(projectId, card.id);
          showToast(`"${card.title}" restored`);
        }}
      >
        restore
      </Button>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete Forever"
        message={`Permanently delete "${card.title}"? This cannot be undone once the undo option below expires.`}
        onConfirm={() => {
          deleteArchivedCard(projectId, card.id);
          showToast(`"${card.title}" deleted forever`, () => undoDeleteArchivedCard(projectId, card));
          setConfirmingDelete(false);
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
