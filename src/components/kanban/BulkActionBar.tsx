"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { normalizeTag } from "@/lib/tags";
import { PRIORITY_COLOR, PRIORITY_TAG } from "@/lib/priority";
import { COLUMNS, PRIORITIES, type ColumnId, type Priority } from "@/types";

interface BulkActionBarProps {
  count: number;
  onMove: (column: ColumnId) => void;
  onSetPriority: (priority: Priority | null) => void;
  onAddTag: (tag: string) => void;
  onArchive: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function BulkActionBar({
  count,
  onMove,
  onSetPriority,
  onAddTag,
  onArchive,
  onDelete,
  onCancel,
}: BulkActionBarProps) {
  const [tagDraft, setTagDraft] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  function submitTag(e: React.FormEvent) {
    e.preventDefault();
    const tag = normalizeTag(tagDraft);
    if (!tag) return;
    onAddTag(tag);
    setTagDraft("");
  }

  return (
    <div className="flex flex-wrap items-center gap-3 px-3 py-2 border-b border-border bg-bg-elevated font-mono text-xs">
      <span className="text-text-primary">{count} selected</span>

      <div className="flex items-center gap-1">
        <span className="text-text-faint">move:</span>
        {COLUMNS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onMove(c.id)}
            className="px-1.5 py-0.5 rounded-sm border border-border text-text-muted hover:border-border-strong hover:text-text-primary transition-colors"
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-text-faint">priority:</span>
        <button
          type="button"
          onClick={() => onSetPriority(null)}
          className="px-1.5 py-0.5 rounded-sm border border-border text-text-faint hover:border-border-strong transition-colors"
        >
          none
        </button>
        {PRIORITIES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSetPriority(p.id)}
            className={clsx(
              "px-1.5 py-0.5 rounded-sm border border-border hover:border-border-strong transition-colors",
              PRIORITY_COLOR[p.id]
            )}
          >
            {PRIORITY_TAG[p.id]}
          </button>
        ))}
      </div>

      <form onSubmit={submitTag} className="flex items-center gap-1">
        <span className="text-text-faint">tag:</span>
        <input
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          placeholder="add tag..."
          className="bg-bg-base border border-border rounded-sm px-1.5 py-0.5 text-text-primary placeholder:text-text-faint w-24"
        />
      </form>

      <Button variant="ghost" size="sm" onClick={() => setConfirmingArchive(true)}>
        Archive
      </Button>
      <Button variant="danger" size="sm" onClick={() => setConfirmingDelete(true)}>
        Delete
      </Button>
      <button
        type="button"
        onClick={onCancel}
        className="ml-auto px-1.5 py-0.5 rounded-sm text-text-faint hover:text-text-primary transition-colors"
      >
        cancel
      </button>

      <ConfirmDialog
        open={confirmingArchive}
        title="Archive Selected"
        message={`Move ${count} selected card${count === 1 ? "" : "s"} to the archive?`}
        confirmLabel="Archive"
        onConfirm={() => {
          onArchive();
          setConfirmingArchive(false);
        }}
        onCancel={() => setConfirmingArchive(false)}
      />

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete Selected"
        message={`Delete ${count} selected card${count === 1 ? "" : "s"}? This cannot be undone once the undo option below expires.`}
        onConfirm={() => {
          onDelete();
          setConfirmingDelete(false);
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
