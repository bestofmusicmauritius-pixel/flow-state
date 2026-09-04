"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import clsx from "clsx";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { compareByDueDate } from "@/lib/dueDate";
import { COLUMN_BRACKET, type ColumnId, type KanbanCard as KanbanCardType } from "@/types";

export type SortMode = "manual" | "due";

interface KanbanColumnProps {
  id: ColumnId;
  title: string;
  cards: KanbanCardType[];
  sortMode: SortMode;
  onAddCard: () => void;
  onCardClick: (cardId: string) => void;
  onToggleSortMode: (mode: SortMode) => void;
  onArchiveCompleted?: () => void;
}

export function KanbanColumn({
  id,
  title,
  cards,
  sortMode,
  onAddCard,
  onCardClick,
  onToggleSortMode,
  onArchiveCompleted,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "column" } });
  const displayedCards = sortMode === "due" ? [...cards].sort(compareByDueDate) : cards;
  const cardIds = displayedCards.map((c) => c.id);

  return (
    <div className="flex flex-col min-h-0 w-80 shrink-0 bg-bg-elevated/60 rounded-md border border-border">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-baseline gap-1.5 font-mono text-sm">
          <span className="text-text-muted">{COLUMN_BRACKET[id]}</span>
          <span className="text-text-primary">{title}</span>
          <span className="text-text-faint text-xs">({cards.length})</span>
        </div>
        <div className="flex items-center gap-1">
          {onArchiveCompleted && (
            <button
              type="button"
              onClick={onArchiveCompleted}
              disabled={cards.length === 0}
              className="font-mono text-[11px] px-1.5 py-0.5 rounded-sm text-text-faint hover:text-text-primary hover:bg-bg-card transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              archive
            </button>
          )}
          <IconButton aria-label={`Add task to ${title}`} onClick={onAddCard}>
            +
          </IconButton>
        </div>
      </div>
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border font-mono text-[11px]">
        <button
          type="button"
          onClick={() => onToggleSortMode("manual")}
          className={clsx(
            "px-1.5 py-0.5 rounded-sm transition-colors",
            sortMode === "manual"
              ? "text-text-primary bg-bg-card"
              : "text-text-faint hover:text-text-muted"
          )}
        >
          manual
        </button>
        <button
          type="button"
          onClick={() => onToggleSortMode("due")}
          className={clsx(
            "px-1.5 py-0.5 rounded-sm transition-colors",
            sortMode === "due"
              ? "text-text-primary bg-bg-card"
              : "text-text-faint hover:text-text-muted"
          )}
        >
          by due date
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 min-h-24 overflow-y-auto px-2 py-2 flex flex-col gap-2 transition-colors",
          isOver && "bg-accent-muted"
        )}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {displayedCards.length === 0 ? (
            <EmptyState>$ no cards yet</EmptyState>
          ) : (
            displayedCards.map((card) => (
              <KanbanCard
                key={card.id}
                card={card}
                onClick={() => onCardClick(card.id)}
                draggable={sortMode === "manual"}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
