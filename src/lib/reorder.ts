import type { ColumnId, KanbanCard } from "@/types";

function cardsInColumn(cards: KanbanCard[], column: ColumnId): KanbanCard[] {
  return cards
    .filter((card) => card.column === column)
    .sort((a, b) => a.order - b.order);
}

function withSequentialOrder(cards: KanbanCard[]): KanbanCard[] {
  return cards.map((card, index) => ({ ...card, order: index }));
}

/** Reorders cards within a single column and returns the full, updated card list. */
export function reorderCardsInColumn(
  allCards: KanbanCard[],
  column: ColumnId,
  fromIndex: number,
  toIndex: number
): KanbanCard[] {
  const columnCards = cardsInColumn(allCards, column);
  const [moved] = columnCards.splice(fromIndex, 1);
  if (!moved) return allCards;
  columnCards.splice(toIndex, 0, moved);
  const reordered = withSequentialOrder(columnCards);
  const reorderedById = new Map(reordered.map((card) => [card.id, card]));

  return allCards.map((card) => reorderedById.get(card.id) ?? card);
}

/**
 * Moves a card to a (possibly different) column at a target index, closing the
 * gap in the source column and shifting the destination column to make room.
 */
export function moveCardToColumn(
  allCards: KanbanCard[],
  cardId: string,
  toColumn: ColumnId,
  toIndex: number
): KanbanCard[] {
  const card = allCards.find((c) => c.id === cardId);
  if (!card) return allCards;

  const fromColumn = card.column;
  const now = new Date().toISOString();

  const sourceRemaining = cardsInColumn(allCards, fromColumn).filter(
    (c) => c.id !== cardId
  );

  const destination =
    fromColumn === toColumn
      ? sourceRemaining
      : cardsInColumn(allCards, toColumn);

  const movedCard: KanbanCard = { ...card, column: toColumn, updatedAt: now };
  const clampedIndex = Math.max(0, Math.min(toIndex, destination.length));
  destination.splice(clampedIndex, 0, movedCard);

  const updated = new Map<string, KanbanCard>();
  withSequentialOrder(destination).forEach((c) => updated.set(c.id, c));
  if (fromColumn !== toColumn) {
    withSequentialOrder(sourceRemaining).forEach((c) => updated.set(c.id, c));
  }

  return allCards.map((c) => updated.get(c.id) ?? c);
}

export function nextOrderInColumn(allCards: KanbanCard[], column: ColumnId): number {
  const columnCards = cardsInColumn(allCards, column);
  if (columnCards.length === 0) return 0;
  return Math.max(...columnCards.map((c) => c.order)) + 1;
}
