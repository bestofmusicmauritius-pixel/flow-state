"use client";

import clsx from "clsx";
import { IconButton } from "@/components/ui/IconButton";
import type { TodoItem } from "@/types";

interface TodoListItemProps {
  todo: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
}

export function TodoListItem({ todo, onToggle, onDelete }: TodoListItemProps) {
  return (
    <div className="group flex items-start gap-2 py-1 px-1 rounded-sm hover:bg-bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={todo.done}
        aria-label={todo.done ? "Mark as not done" : "Mark as done"}
        className={clsx(
          "mt-0.5 w-3.5 h-3.5 shrink-0 rounded-sm border flex items-center justify-center transition-colors",
          todo.done
            ? "bg-accent border-accent text-bg-base"
            : "border-border-strong text-transparent hover:border-accent"
        )}
      >
        <span className="text-[10px] leading-none">✓</span>
      </button>
      <span
        className={clsx(
          "flex-1 text-sm font-sans break-words",
          todo.done ? "text-text-faint line-through" : "text-text-primary"
        )}
      >
        {todo.text}
      </span>
      <IconButton
        aria-label="Delete todo"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100"
      >
        ×
      </IconButton>
    </div>
  );
}
