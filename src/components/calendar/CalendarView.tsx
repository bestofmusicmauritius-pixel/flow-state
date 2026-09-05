"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useAppStateContext } from "@/context/AppStateContext";
import { getDueUrgency, DUE_COLOR } from "@/lib/dueDate";
import { PRIORITY_COLOR, PRIORITY_TAG } from "@/lib/priority";
import { COLUMN_BRACKET, type Priority } from "@/types";

interface CalendarItem {
  key: string;
  type: "card" | "todo";
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  bracket: string;
  priority?: Priority;
  isDone: boolean;
}

const WEEKDAY_LABELS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const MAX_VISIBLE_PER_DAY = 3;

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthGridDays(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
}

interface CalendarViewProps {
  onJumpToItem: (projectId: string, cardId: string | null) => void;
}

export function CalendarView({ onJumpToItem }: CalendarViewProps) {
  const { state } = useAppStateContext();
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const project of state.projects) {
      for (const card of project.cards) {
        if (!card.dueDate) continue;
        const list = map.get(card.dueDate) ?? [];
        list.push({
          key: `card:${card.id}`,
          type: "card",
          id: card.id,
          projectId: project.id,
          projectName: project.name,
          title: card.title,
          bracket: COLUMN_BRACKET[card.column],
          priority: card.priority,
          isDone: card.column === "complete",
        });
        map.set(card.dueDate, list);
      }
      for (const todo of project.todos) {
        if (!todo.dueDate) continue;
        const list = map.get(todo.dueDate) ?? [];
        list.push({
          key: `todo:${todo.id}`,
          type: "todo",
          id: todo.id,
          projectId: project.id,
          projectName: project.name,
          title: todo.text,
          bracket: todo.done ? "[x]" : "[ ]",
          priority: todo.priority,
          isDone: todo.done,
        });
        map.set(todo.dueDate, list);
      }
    }
    return map;
  }, [state]);

  const days = useMemo(
    () => monthGridDays(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );
  const todayISO = toISODate(today);
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        <div className="flex items-center justify-between font-mono text-sm">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="px-1.5 py-0.5 rounded-sm text-text-faint hover:text-text-primary hover:bg-bg-card transition-colors"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span className="text-text-primary w-40 text-center">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="px-1.5 py-0.5 rounded-sm text-text-faint hover:text-text-primary hover:bg-bg-card transition-colors"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-1.5 py-0.5 rounded-sm border border-border text-text-faint hover:border-border-strong hover:text-text-primary transition-colors text-xs"
          >
            today
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden border border-border">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="bg-bg-elevated px-2 py-1 font-mono text-[11px] text-text-faint text-center"
            >
              {label}
            </div>
          ))}
          {days.map((day) => {
            const iso = toISODate(day);
            const inMonth = day.getMonth() === cursor.getMonth();
            const isToday = iso === todayISO;
            const dayItems = (itemsByDate.get(iso) ?? []).slice().sort((a, b) =>
              a.isDone === b.isDone ? 0 : a.isDone ? 1 : -1
            );
            const overflow = dayItems.length - MAX_VISIBLE_PER_DAY;

            return (
              <div
                key={iso}
                className={clsx(
                  "bg-bg-base min-h-24 p-1.5 flex flex-col gap-1",
                  !inMonth && "opacity-40"
                )}
              >
                <span
                  className={clsx(
                    "font-mono text-[11px] self-start px-1 rounded-sm",
                    isToday ? "bg-accent text-bg-base font-medium" : "text-text-faint"
                  )}
                >
                  {day.getDate()}
                </span>
                <div className="flex flex-col gap-0.5">
                  {dayItems.slice(0, MAX_VISIBLE_PER_DAY).map((item) => {
                    const urgency = item.isDone ? "later" : getDueUrgency(iso, undefined, item.isDone);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          onJumpToItem(item.projectId, item.type === "card" ? item.id : null)
                        }
                        className={clsx(
                          "flex items-center gap-1 text-left font-mono text-[11px] rounded-sm px-1 py-0.5 hover:bg-bg-card transition-colors truncate",
                          item.isDone ? "text-text-faint line-through" : DUE_COLOR[urgency]
                        )}
                        title={`${item.projectName} · ${item.title}`}
                      >
                        {item.priority && !item.isDone && (
                          <span className={clsx("shrink-0", PRIORITY_COLOR[item.priority])}>
                            {PRIORITY_TAG[item.priority]}
                          </span>
                        )}
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                  {overflow > 0 && (
                    <span className="font-mono text-[11px] text-text-faint px-1">
                      +{overflow} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
