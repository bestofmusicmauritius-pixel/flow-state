"use client";

import { useState } from "react";
import clsx from "clsx";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { PRIORITY_COLOR, PRIORITY_TAG } from "@/lib/priority";
import { PRIORITIES, type Priority } from "@/types";

export interface CardDialogSubmitValues {
  title: string;
  description: string;
  priority: Priority | null;
  dueDate: string | null;
  dueTime: string | null;
}

interface CardDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialTitle?: string;
  initialDescription?: string;
  initialPriority?: Priority;
  initialDueDate?: string;
  initialDueTime?: string;
  onClose: () => void;
  onSubmit: (values: CardDialogSubmitValues) => void;
  onDelete?: () => void;
}

export function CardDialog({
  open,
  mode,
  initialTitle = "",
  initialDescription = "",
  initialPriority,
  initialDueDate,
  initialDueTime,
  onClose,
  onSubmit,
  onDelete,
}: CardDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState<Priority | null>(initialPriority ?? null);
  const [dueDate, setDueDate] = useState<string>(initialDueDate ?? "");
  const [dueTime, setDueTime] = useState<string>(initialDueTime ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title,
      description,
      priority,
      dueDate: dueDate || null,
      dueTime: dueDate ? dueTime || null : null,
    });
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
        <div>
          <p className="font-mono text-xs text-text-faint mb-1.5">{"// priority"}</p>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Priority">
            <button
              type="button"
              role="radio"
              aria-checked={priority === null}
              onClick={() => setPriority(null)}
              className={clsx(
                "font-mono text-xs px-2 py-1 rounded-sm border transition-colors",
                priority === null
                  ? "border-border-strong text-text-primary bg-bg-card"
                  : "border-border text-text-faint hover:border-border-strong"
              )}
            >
              none
            </button>
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={priority === p.id}
                onClick={() => setPriority(p.id)}
                className={clsx(
                  "font-mono text-xs px-2 py-1 rounded-sm border transition-colors",
                  priority === p.id
                    ? clsx("border-current bg-bg-card", PRIORITY_COLOR[p.id])
                    : clsx("border-border hover:border-border-strong", PRIORITY_COLOR[p.id])
                )}
              >
                {PRIORITY_TAG[p.id]} {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-xs text-text-faint mb-1.5">{"// due date"}</p>
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-auto"
            />
            {dueDate && (
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-auto"
              />
            )}
            {dueDate && (
              <button
                type="button"
                onClick={() => {
                  setDueDate("");
                  setDueTime("");
                }}
                className="font-mono text-xs px-2 py-1 rounded-sm border border-border text-text-faint hover:border-border-strong hover:text-text-primary transition-colors"
              >
                clear
              </button>
            )}
          </div>
        </div>
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
