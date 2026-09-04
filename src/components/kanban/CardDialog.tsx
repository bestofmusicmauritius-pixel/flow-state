"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface CardDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialTitle?: string;
  initialDescription?: string;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
  onDelete?: () => void;
}

export function CardDialog({
  open,
  mode,
  initialTitle = "",
  initialDescription = "",
  onClose,
  onSubmit,
  onDelete,
}: CardDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title, description);
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title={mode === "create" ? "New Task" : "Edit Task"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          maxLength={120}
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={4}
        />
        <div className="flex justify-between items-center mt-2">
          {mode === "edit" && onDelete ? (
            <Button type="button" variant="danger" size="sm" onClick={onDelete}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!title.trim()}>
              {mode === "create" ? "Add" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
