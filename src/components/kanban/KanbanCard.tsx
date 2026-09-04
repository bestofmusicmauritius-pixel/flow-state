"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { getDueUrgency, formatDueDateTime, DUE_COLOR, DUE_LABEL } from "@/lib/dueDate";
import { formatRelativeTime } from "@/lib/format";
import { PRIORITY_COLOR, PRIORITY_TAG } from "@/lib/priority";
import type { KanbanCard as KanbanCardType } from "@/types";

interface KanbanCardProps {
  card: KanbanCardType;
  onClick: () => void;
  draggable?: boolean;
}

export function KanbanCard({ card, onClick, draggable = true }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", column: card.column },
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      className={clsx(
        "group bg-bg-card border border-border rounded-sm cursor-default transition-[border-color,box-shadow]",
        "hover:border-accent/50",
        "focus:outline-none focus-visible:border-accent focus-visible:shadow-[0_0_0_1px_var(--color-accent)]",
        isDragging && "opacity-30"
      )}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          {...(draggable ? attributes : {})}
          {...(draggable ? listeners : {})}
          onClick={(e) => e.stopPropagation()}
          disabled={!draggable}
          aria-label="Drag to reorder"
          className={clsx(
            "shrink-0 w-3 flex items-center justify-center font-mono text-sm leading-none",
            draggable
              ? "text-text-faint hover:text-accent cursor-grab active:cursor-grabbing"
              : "text-border-strong cursor-not-allowed"
          )}
        >
          │
        </button>
        <div className="flex-1 min-w-0 py-2.5 pr-3">
          <p className="text-sm font-mono text-text-primary break-words">
            {card.priority && (
              <span className={clsx("mr-1.5", PRIORITY_COLOR[card.priority])}>
                {PRIORITY_TAG[card.priority]}
              </span>
            )}
            {card.title}
          </p>
          {card.description && (
            <p className="mt-1 text-xs font-mono text-text-muted break-words line-clamp-3">
              {card.description}
            </p>
          )}
          {card.dueDate &&
            (() => {
              const urgency = getDueUrgency(card.dueDate, card.dueTime, card.column === "complete");
              return (
                <p className={clsx("mt-1.5 font-mono text-[11px]", DUE_COLOR[urgency])}>
                  {DUE_LABEL[urgency]} {formatDueDateTime(card.dueDate, card.dueTime)}
                </p>
              );
            })()}
          <p className="mt-1 font-mono text-[11px] text-text-faint">
            {formatRelativeTime(card.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
