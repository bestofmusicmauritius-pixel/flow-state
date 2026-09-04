"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface ProjectDialogProps {
  open: boolean;
  mode: "create" | "rename";
  initialName?: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function ProjectDialog({
  open,
  mode,
  initialName = "",
  onClose,
  onSubmit,
}: ProjectDialogProps) {
  const [name, setName] = useState(initialName);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === "create" ? "New Project" : "Rename Project"}
    >
      <form onSubmit={handleSubmit}>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          maxLength={60}
        />
        <div className="flex justify-end gap-2 mt-5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!name.trim()}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
