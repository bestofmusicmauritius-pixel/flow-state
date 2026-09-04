"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { IconButton } from "@/components/ui/IconButton";
import { getDueUrgency, DUE_COLOR, DUE_LABEL } from "@/lib/dueDate";
import { PRIORITY_COLOR, PRIORITY_TAG } from "@/lib/priority";
import { PRIORITIES, type Priority, type TodoItem } from "@/types";

interface TodoListItemProps {
  todo: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
  onChangePriority: (priority: Priority | null) => void;
  onChangeDueDate: (dueDate: string | null) => void;
}

export function TodoListItem({
  todo,
  onToggle,
  onDelete,
  onChangePriority,
  onChangeDueDate,
}: TodoListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  });
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const urgency = todo.dueDate ? getDueUrgency(todo.dueDate, todo.done) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group flex flex-col gap-0.5 py-1 px-1 rounded-sm hover:bg-bg-card",
        isDragging && "opacity-30"
      )}
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="mt-0.5 shrink-0 w-3 flex items-center justify-center text-text-faint hover:text-accent cursor-grab active:cursor-grabbing font-mono text-xs leading-none"
        >
          │
        </button>
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

      <div className="flex items-center gap-1.5 pl-4 font-mono text-[11px]">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPriorityMenuOpen((v) => !v)}
            className={clsx(
              todo.priority ? PRIORITY_COLOR[todo.priority] : "text-text-faint",
              "hover:opacity-80 transition-opacity"
            )}
          >
            {todo.priority ? PRIORITY_TAG[todo.priority] : "[--]"}
          </button>
          {priorityMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setPriorityMenuOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-50 flex flex-wrap gap-1 w-40 bg-bg-elevated border border-border-strong rounded-md shadow-[0_0_0_1px_rgba(255,181,69,0.08),0_8px_24px_rgba(0,0,0,0.5)] p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onChangePriority(null);
                    setPriorityMenuOpen(false);
                  }}
                  className="px-1.5 py-0.5 rounded-sm border border-border text-text-faint hover:border-border-strong"
                >
                  none
                </button>
                {PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChangePriority(p.id);
                      setPriorityMenuOpen(false);
                    }}
                    className={clsx(
                      "px-1.5 py-0.5 rounded-sm border border-border hover:border-border-strong",
                      PRIORITY_COLOR[p.id]
                    )}
                  >
                    {PRIORITY_TAG[p.id]}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {editingDueDate ? (
          <input
            type="date"
            autoFocus
            defaultValue={todo.dueDate ?? ""}
            onBlur={(e) => {
              onChangeDueDate(e.target.value || null);
              setEditingDueDate(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setEditingDueDate(false);
            }}
            className="bg-bg-base border border-border rounded-sm px-1 py-0.5 text-text-primary font-mono text-[11px]"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingDueDate(true)}
            className={clsx(
              urgency ? DUE_COLOR[urgency] : "text-text-faint",
              "hover:opacity-80 transition-opacity"
            )}
          >
            {urgency && todo.dueDate ? `${DUE_LABEL[urgency]} ${todo.dueDate}` : "+ due"}
          </button>
        )}
      </div>
    </div>
  );
}
