"use client";

import { useState } from "react";
import { useAppStateContext } from "@/context/AppStateContext";
import { useToast } from "@/context/ToastContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { normalizeTag } from "@/lib/tags";

interface TagChipProps {
  tag: string;
  onSelect: (tag: string) => void;
}

export function TagChip({ tag, onSelect }: TagChipProps) {
  const { state, replaceState, renameTagEverywhere, deleteTagEverywhere } = useAppStateContext();
  const { showToast } = useToast();
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(tag);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleRename(e: React.FormEvent) {
    e.preventDefault();
    const newTag = normalizeTag(draft);
    setRenaming(false);
    if (!newTag || newTag === tag) return;
    const before = state;
    renameTagEverywhere(tag, newTag);
    showToast(`#${tag} renamed to #${newTag}`, () => replaceState(before));
  }

  return (
    <div className="group relative flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => onSelect(tag)}
        className="font-mono text-xs px-1.5 py-0.5 rounded-sm border border-border text-text-muted hover:border-border-strong hover:text-text-primary transition-colors"
      >
        #{tag}
      </button>
      <div className="flex items-center opacity-0 group-hover:opacity-100">
        <IconButton
          aria-label={`Rename tag ${tag}`}
          onClick={() => {
            setDraft(tag);
            setRenaming(true);
          }}
          className="w-5 h-5"
        >
          ✎
        </IconButton>
        <IconButton
          aria-label={`Delete tag ${tag}`}
          onClick={() => setConfirmingDelete(true)}
          className="w-5 h-5"
        >
          ×
        </IconButton>
      </div>

      <Dialog open={renaming} onClose={() => setRenaming(false)} title="Rename Tag">
        <form onSubmit={handleRename} className="flex flex-col gap-3">
          <p className="text-sm text-text-muted">
            Renames #{tag} on every card and todo that has it, in every project.
          </p>
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="new tag name"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setRenaming(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!draft.trim()}>
              Rename
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete Tag"
        message={`Remove #${tag} from every card and todo that has it, in every project? The items themselves aren't touched — just this tag.`}
        confirmLabel="Delete"
        onConfirm={() => {
          const before = state;
          deleteTagEverywhere(tag);
          showToast(`#${tag} deleted`, () => replaceState(before));
          setConfirmingDelete(false);
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
