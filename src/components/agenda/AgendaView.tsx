"use client";

import clsx from "clsx";
import { useAppStateContext } from "@/context/AppStateContext";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getDueTimestamp,
  getDueUrgency,
  formatDueDateTime,
  DUE_COLOR,
  DUE_LABEL,
  type DueUrgency,
} from "@/lib/dueDate";
import { PRIORITY_COLOR, PRIORITY_TAG } from "@/lib/priority";
import { COLUMN_BRACKET, type Priority } from "@/types";

interface AgendaItem {
  key: string;
  projectId: string;
  projectName: string;
  title: string;
  bracket: string;
  priority?: Priority;
  dueDate: string;
  dueTime?: string;
  urgency: DueUrgency;
}

const URGENCY_ORDER: DueUrgency[] = [
  "overdue",
  "today",
  "tomorrow",
  "week",
  "twoWeeks",
  "month",
  "later",
];

const GROUP_LABEL: Record<DueUrgency, string> = {
  overdue: "overdue",
  today: "today",
  tomorrow: "tomorrow",
  week: "this week",
  twoWeeks: "in 2 weeks",
  month: "this month",
  later: "later",
};

interface AgendaViewProps {
  onJumpToProject: (projectId: string) => void;
}

export function AgendaView({ onJumpToProject }: AgendaViewProps) {
  const { state } = useAppStateContext();

  const items: AgendaItem[] = [];
  for (const project of state.projects) {
    for (const card of project.cards) {
      if (card.column === "complete" || !card.dueDate) continue;
      items.push({
        key: `card:${card.id}`,
        projectId: project.id,
        projectName: project.name,
        title: card.title,
        bracket: COLUMN_BRACKET[card.column],
        priority: card.priority,
        dueDate: card.dueDate,
        dueTime: card.dueTime,
        urgency: getDueUrgency(card.dueDate, card.dueTime, false),
      });
    }
    for (const todo of project.todos) {
      if (todo.done || !todo.dueDate) continue;
      items.push({
        key: `todo:${todo.id}`,
        projectId: project.id,
        projectName: project.name,
        title: todo.text,
        bracket: "[ ]",
        priority: todo.priority,
        dueDate: todo.dueDate,
        dueTime: todo.dueTime,
        urgency: getDueUrgency(todo.dueDate, todo.dueTime, false),
      });
    }
  }

  items.sort(
    (a, b) => getDueTimestamp(a.dueDate, a.dueTime) - getDueTimestamp(b.dueDate, b.dueTime)
  );

  const groups = URGENCY_ORDER.map((urgency) => ({
    urgency,
    items: items.filter((item) => item.urgency === urgency),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState>$ nothing due — you&apos;re clear</EmptyState>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.urgency}>
            <h2
              className={clsx(
                "font-mono text-xs mb-2 pb-1 border-b border-border",
                DUE_COLOR[group.urgency]
              )}
            >
              {GROUP_LABEL[group.urgency]} ({group.items.length})
            </h2>
            <div className="flex flex-col">
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onJumpToProject(item.projectId)}
                  className="flex items-center gap-2 py-1.5 px-1 rounded-sm hover:bg-bg-card transition-colors text-left font-mono text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <span className="text-text-muted shrink-0">{item.bracket}</span>
                  <span className="text-text-faint shrink-0">{item.projectName}</span>
                  <span className="text-text-faint shrink-0">·</span>
                  {item.priority && (
                    <span className={clsx("shrink-0", PRIORITY_COLOR[item.priority])}>
                      {PRIORITY_TAG[item.priority]}
                    </span>
                  )}
                  <span className="text-text-primary truncate flex-1">{item.title}</span>
                  <span className={clsx("shrink-0 text-xs", DUE_COLOR[item.urgency])}>
                    {DUE_LABEL[item.urgency]} {formatDueDateTime(item.dueDate, item.dueTime)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
