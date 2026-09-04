"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useAppStateContext } from "@/context/AppStateContext";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCardOverlay } from "@/components/kanban/KanbanCardOverlay";
import { CardDialog } from "@/components/kanban/CardDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLUMNS, type ColumnId, type KanbanCard as KanbanCardType } from "@/types";

export function KanbanBoard() {
  const { activeProject, addCard, updateCard, deleteCard, moveCard, reorderCards } =
    useAppStateContext();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [creatingColumn, setCreatingColumn] = useState<ColumnId | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState>$ select or create a project to get started</EmptyState>
      </div>
    );
  }

  const cards = activeProject.cards;

  function cardsInColumn(column: ColumnId): KanbanCardType[] {
    return cards.filter((c) => c.column === column).sort((a, b) => a.order - b.order);
  }

  function resolveColumn(overId: string): ColumnId | null {
    if (COLUMNS.some((c) => c.id === overId)) return overId as ColumnId;
    const card = cards.find((c) => c.id === overId);
    return card?.column ?? null;
  }

  const activeCard = cards.find((c) => c.id === activeCardId) ?? null;
  const editingCard = cards.find((c) => c.id === editingCardId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const draggedCard = cards.find((c) => c.id === active.id);
    if (!draggedCard) return;
    const overColumn = resolveColumn(over.id as string);
    if (!overColumn || overColumn === draggedCard.column) return;

    const isOverColumn = COLUMNS.some((c) => c.id === over.id);
    const destination = cardsInColumn(overColumn);
    const targetIndex = isOverColumn
      ? destination.length
      : destination.findIndex((c) => c.id === over.id);

    moveCard(draggedCard.id, overColumn, targetIndex === -1 ? destination.length : targetIndex);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCardId(null);
    if (!over) return;

    const draggedCard = cards.find((c) => c.id === active.id);
    const overColumn = resolveColumn(over.id as string);
    if (!draggedCard || !overColumn || draggedCard.column !== overColumn) return;

    const columnCards = cardsInColumn(overColumn);
    const fromIndex = columnCards.findIndex((c) => c.id === active.id);
    const isOverColumn = COLUMNS.some((c) => c.id === over.id);
    const toIndex = isOverColumn
      ? columnCards.length - 1
      : columnCards.findIndex((c) => c.id === over.id);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      reorderCards(overColumn, fromIndex, toIndex);
    }
  }

  return (
    <div className="flex-1 min-h-0 overflow-x-auto px-4 py-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 h-full min-h-0">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              cards={cardsInColumn(column.id)}
              onAddCard={() => setCreatingColumn(column.id)}
              onCardClick={(cardId) => setEditingCardId(cardId)}
            />
          ))}
        </div>
        <DragOverlay>{activeCard ? <KanbanCardOverlay card={activeCard} /> : null}</DragOverlay>
      </DndContext>

      <CardDialog
        key={creatingColumn ?? "create-closed"}
        open={creatingColumn !== null}
        mode="create"
        onClose={() => setCreatingColumn(null)}
        onSubmit={(title, description, priority) => {
          if (creatingColumn) addCard(creatingColumn, title, description, priority ?? undefined);
        }}
      />

      <CardDialog
        key={editingCardId ?? "edit-closed"}
        open={editingCard !== null}
        mode="edit"
        initialTitle={editingCard?.title}
        initialDescription={editingCard?.description}
        initialPriority={editingCard?.priority}
        onClose={() => setEditingCardId(null)}
        onSubmit={(title, description, priority) => {
          if (editingCardId) updateCard(editingCardId, { title, description, priority });
        }}
        onDelete={() => {
          setDeletingCardId(editingCardId);
          setEditingCardId(null);
        }}
      />

      <ConfirmDialog
        open={deletingCardId !== null}
        title="Delete Task"
        message="Delete this task? This cannot be undone."
        onConfirm={() => {
          if (deletingCardId) deleteCard(deletingCardId);
          setDeletingCardId(null);
        }}
        onCancel={() => setDeletingCardId(null)}
      />
    </div>
  );
}
