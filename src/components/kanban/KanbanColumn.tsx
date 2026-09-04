"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import clsx from "clsx";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import type { ColumnId, KanbanCard as KanbanCardType } from "@/types";

const BRACKET: Record<ColumnId, string> = {
  todo: "[ ]",
  "in-progress": "[~]",
  complete: "[x]",
};

interface KanbanColumnProps {
  id: ColumnId;
  title: string;
  cards: KanbanCardType[];
  onAddCard: () => void;
  onCardClick: (cardId: string) => void;
}

export function KanbanColumn({ id, title, cards, onAddCard, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "column" } });
  const cardIds = cards.map((c) => c.id);

  return (
    <div className="flex flex-col min-h-0 w-80 shrink-0 bg-bg-elevated/60 rounded-md border border-border">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-baseline gap-1.5 font-mono text-sm">
          <span className="text-text-muted">{BRACKET[id]}</span>
          <span className="text-text-primary">{title}</span>
          <span className="text-text-faint text-xs">({cards.length})</span>
        </div>
        <IconButton aria-label={`Add task to ${title}`} onClick={onAddCard}>
          +
        </IconButton>
      </div>
      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 min-h-24 overflow-y-auto px-2 py-2 flex flex-col gap-2 transition-colors",
          isOver && "bg-accent-muted"
        )}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.length === 0 ? (
            <EmptyState>$ no cards yet</EmptyState>
          ) : (
            cards.map((card) => (
              <KanbanCard key={card.id} card={card} onClick={() => onCardClick(card.id)} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
