import clsx from "clsx";
import { getDueUrgency, DUE_COLOR, DUE_LABEL } from "@/lib/dueDate";
import { formatRelativeTime } from "@/lib/format";
import { PRIORITY_COLOR, PRIORITY_TAG } from "@/lib/priority";
import type { KanbanCard as KanbanCardType } from "@/types";

export function KanbanCardOverlay({ card }: { card: KanbanCardType }) {
  return (
    <div className="bg-bg-card border border-accent rounded-sm shadow-[0_0_16px_rgba(255,181,69,0.35)] w-72 flex items-stretch">
      <span className="shrink-0 w-3 flex items-center justify-center text-accent font-mono text-sm leading-none">
        │
      </span>
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
            const urgency = getDueUrgency(card.dueDate, card.column === "complete");
            return (
              <p className={clsx("mt-1.5 font-mono text-[11px]", DUE_COLOR[urgency])}>
                {DUE_LABEL[urgency]} {card.dueDate}
              </p>
            );
          })()}
        <p className="mt-1 font-mono text-[11px] text-text-faint">
          {formatRelativeTime(card.updatedAt)}
        </p>
      </div>
    </div>
  );
}
