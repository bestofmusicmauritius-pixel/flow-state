"use client";

import { useEffect, useRef, useState } from "react";
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
import { useToast } from "@/context/ToastContext";
import { KanbanColumn, type SortMode } from "@/components/kanban/KanbanColumn";
import { KanbanCardOverlay } from "@/components/kanban/KanbanCardOverlay";
import { BulkActionBar } from "@/components/kanban/BulkActionBar";
import { CardDialog } from "@/components/kanban/CardDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { COLUMNS, type ColumnId, type KanbanCard as KanbanCardType, type Priority } from "@/types";

interface KanbanBoardProps {
  /** Deep-link request from elsewhere (e.g. the agenda view) to open a
   * specific card's edit dialog once its project becomes active. */
  openCardId?: string | null;
  onCardOpened?: () => void;
  /** One-shot request (e.g. the "n" keyboard shortcut) to open the create-task
   * dialog for the "todo" column. */
  requestCreate?: boolean;
  onCreateRequested?: () => void;
}

export function KanbanBoard({
  openCardId,
  onCardOpened,
  requestCreate,
  onCreateRequested,
}: KanbanBoardProps) {
  const {
    activeProject,
    addCard,
    updateCard,
    deleteCard,
    undoDeleteCard,
    moveCard,
    advanceRecurringCard,
    replaceCards,
    reorderCards,
    archiveCard,
    archiveCompletedCards,
    restoreCard,
    restoreCards,
    bulkMoveCards,
    bulkSetPriority,
    bulkAddTag,
    bulkArchiveCards,
    bulkDeleteCards,
    bulkUndoDeleteCards,
    startTimer,
    stopTimer,
    resetTimer,
  } = useAppStateContext();
  const { showToast } = useToast();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [creatingColumn, setCreatingColumn] = useState<ColumnId | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [confirmingArchiveComplete, setConfirmingArchiveComplete] = useState(false);
  const [sortModes, setSortModes] = useState<Record<ColumnId, SortMode>>({
    todo: "manual",
    "in-progress": "manual",
    complete: "manual",
  });
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Snapshot of every card's column/order right before a drag starts. A ref,
  // not state, since it must survive the onDragOver mutations that happen
  // mid-drag without itself triggering a re-render — it's only ever read
  // once the drag actually ends.
  const dragStartCardsRef = useRef<KanbanCardType[] | null>(null);

  useEffect(() => {
    // openCardId is a one-shot external command (from the agenda view), not
    // derived state — editingCardId also changes independently from card
    // clicks, so it can't be replaced by deriving from props during render.
    if (!openCardId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditingCardId(openCardId);
    onCardOpened?.();
  }, [openCardId, onCardOpened]);

  useEffect(() => {
    if (!requestCreate) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCreatingColumn("todo");
    onCreateRequested?.();
  }, [requestCreate, onCreateRequested]);

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState>$ select or create a project to get started</EmptyState>
      </div>
    );
  }

  const cards = activeProject.cards;
  const projectId = activeProject.id;

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

  function toggleCardSelection(cardId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function handleBulkMove(column: ColumnId) {
    const snapshot = cards;
    const count = selectedIds.size;
    bulkMoveCards(Array.from(selectedIds), column);
    showToast(`${count} card${count === 1 ? "" : "s"} moved to ${column}`, () =>
      replaceCards(projectId, snapshot)
    );
    setSelectedIds(new Set());
  }

  function handleBulkSetPriority(priority: Priority | null) {
    const snapshot = cards;
    const count = selectedIds.size;
    bulkSetPriority(Array.from(selectedIds), priority);
    showToast(`priority updated on ${count} card${count === 1 ? "" : "s"}`, () =>
      replaceCards(projectId, snapshot)
    );
    setSelectedIds(new Set());
  }

  function handleBulkAddTag(tag: string) {
    const snapshot = cards;
    const count = selectedIds.size;
    bulkAddTag(Array.from(selectedIds), tag);
    showToast(`tag added to ${count} card${count === 1 ? "" : "s"}`, () =>
      replaceCards(projectId, snapshot)
    );
    setSelectedIds(new Set());
  }

  function handleBulkArchive() {
    const ids = Array.from(selectedIds);
    bulkArchiveCards(ids);
    showToast(`${ids.length} card${ids.length === 1 ? "" : "s"} archived`, () =>
      restoreCards(projectId, ids)
    );
    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    const deletedCards = cards.filter((c) => selectedIds.has(c.id));
    bulkDeleteCards(Array.from(selectedIds));
    showToast(`${deletedCards.length} card${deletedCards.length === 1 ? "" : "s"} deleted`, () =>
      bulkUndoDeleteCards(projectId, deletedCards)
    );
    setSelectedIds(new Set());
  }

  function handleDragStart(event: DragStartEvent) {
    dragStartCardsRef.current = cards;
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
    const snapshot = dragStartCardsRef.current;
    dragStartCardsRef.current = null;
    if (!over) return;

    const draggedCard = cards.find((c) => c.id === active.id);
    if (!draggedCard) return;

    function offerUndo(message: string) {
      // Cross-column moves and recurrence advances can shift more than one
      // card's order at once, so undo restores the whole pre-drag snapshot
      // rather than trying to compute a precise inverse. Deliberately NOT
      // offered for same-column reordering below — that's low-stakes and
      // trivially reversible by dragging again, so a toast every time would
      // just be noise.
      if (snapshot) showToast(message, () => replaceCards(projectId, snapshot));
    }

    // Only fires on a confirmed drop, not the onDragOver hover-preview above —
    // see advanceRecurringCard's comment for why that distinction matters.
    if (draggedCard.column === "complete" && draggedCard.recurrence && draggedCard.dueDate) {
      advanceRecurringCard(draggedCard.id);
      offerUndo(`"${draggedCard.title}" completed and rescheduled`);
      return;
    }

    const originalColumn = snapshot?.find((c) => c.id === active.id)?.column;
    if (originalColumn && originalColumn !== draggedCard.column) {
      // The move itself already happened via onDragOver above, as the user
      // dragged across the column boundary — this is just the undo offer
      // for the drop that just confirmed it.
      offerUndo(`"${draggedCard.title}" moved to ${draggedCard.column}`);
      return;
    }

    const overColumn = resolveColumn(over.id as string);
    if (!overColumn || draggedCard.column !== overColumn) return;

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
      <div className="flex items-center justify-end mb-2">
        <button
          type="button"
          onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
          className="font-mono text-[11px] px-2 py-1 rounded-sm border border-border text-text-faint hover:text-text-primary hover:border-border-strong transition-colors"
        >
          {selectMode ? "done selecting" : "select"}
        </button>
      </div>

      {selectMode && selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onMove={handleBulkMove}
          onSetPriority={handleBulkSetPriority}
          onAddTag={handleBulkAddTag}
          onArchive={handleBulkArchive}
          onDelete={handleBulkDelete}
          onCancel={exitSelectMode}
        />
      )}

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
              sortMode={sortModes[column.id]}
              onAddCard={() => setCreatingColumn(column.id)}
              onQuickAdd={(parsed) =>
                addCard(column.id, parsed.title, {
                  priority: parsed.priority ?? undefined,
                  dueDate: parsed.dueDate ?? undefined,
                  dueTime: parsed.dueTime ?? undefined,
                  tags: parsed.tags,
                })
              }
              onCardClick={(cardId) => setEditingCardId(cardId)}
              onToggleSortMode={(mode) =>
                setSortModes((prev) => ({ ...prev, [column.id]: mode }))
              }
              onArchiveCompleted={
                column.id === "complete" ? () => setConfirmingArchiveComplete(true) : undefined
              }
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleCardSelection}
              onStartTimer={startTimer}
              onStopTimer={stopTimer}
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
        onSubmit={({ title, description, priority, dueDate, dueTime, recurrence, tags }) => {
          if (creatingColumn) {
            addCard(creatingColumn, title, {
              description,
              priority: priority ?? undefined,
              dueDate: dueDate ?? undefined,
              dueTime: dueTime ?? undefined,
              recurrence: recurrence ?? undefined,
              tags,
            });
          }
        }}
      />

      <CardDialog
        key={editingCardId ?? "edit-closed"}
        open={editingCard !== null}
        mode="edit"
        initialTitle={editingCard?.title}
        initialDescription={editingCard?.description}
        initialPriority={editingCard?.priority}
        initialDueDate={editingCard?.dueDate}
        initialDueTime={editingCard?.dueTime}
        initialRecurrence={editingCard?.recurrence}
        initialTags={editingCard?.tags}
        trackedSeconds={editingCard?.trackedSeconds}
        timerStartedAt={editingCard?.timerStartedAt}
        onStartTimer={editingCardId ? () => startTimer(editingCardId) : undefined}
        onStopTimer={editingCardId ? () => stopTimer(editingCardId) : undefined}
        onResetTimer={editingCardId ? () => resetTimer(editingCardId) : undefined}
        onClose={() => setEditingCardId(null)}
        onSubmit={({ title, description, priority, dueDate, dueTime, recurrence, tags }) => {
          if (editingCardId) {
            updateCard(editingCardId, {
              title,
              description,
              priority,
              dueDate,
              dueTime,
              recurrence,
              tags,
            });
          }
        }}
        onDelete={() => {
          setDeletingCardId(editingCardId);
          setEditingCardId(null);
        }}
        onArchive={() => {
          if (editingCardId) {
            archiveCard(activeProject.id, editingCardId);
            showToast("Task archived", () => restoreCard(activeProject.id, editingCardId));
          }
          setEditingCardId(null);
        }}
      />

      <ConfirmDialog
        open={deletingCardId !== null}
        title="Delete Task"
        message="Delete this task? This cannot be undone once the undo option below expires."
        onConfirm={() => {
          if (deletingCardId) {
            const card = cards.find((c) => c.id === deletingCardId);
            deleteCard(deletingCardId);
            if (card) {
              showToast(`"${card.title}" deleted`, () => undoDeleteCard(activeProject.id, card));
            }
          }
          setDeletingCardId(null);
        }}
        onCancel={() => setDeletingCardId(null)}
      />

      <ConfirmDialog
        open={confirmingArchiveComplete}
        title="Archive Completed"
        message="Move every card in Complete to the archive? You can restore them later from search or the archive view."
        confirmLabel="Archive"
        onConfirm={() => {
          const archivedIds = cardsInColumn("complete").map((c) => c.id);
          archiveCompletedCards(activeProject.id);
          if (archivedIds.length > 0) {
            showToast(`${archivedIds.length} task${archivedIds.length === 1 ? "" : "s"} archived`, () =>
              restoreCards(activeProject.id, archivedIds)
            );
          }
          setConfirmingArchiveComplete(false);
        }}
        onCancel={() => setConfirmingArchiveComplete(false)}
      />
    </div>
  );
}
