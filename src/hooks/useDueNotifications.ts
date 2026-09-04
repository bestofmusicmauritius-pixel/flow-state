"use client";

import { useEffect, useRef } from "react";
import { getDueTimestamp } from "@/lib/dueDate";
import type { AppState } from "@/types";

const NOTIFIED_KEY = "flow-state:notified-due";
const CHECK_INTERVAL_MS = 60_000;

function loadNotified(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(NOTIFIED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveNotified(notified: Set<string>) {
  try {
    window.localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...notified]));
  } catch {
    // ignore quota errors — a missed prune just means a little dead storage
  }
}

/**
 * Fires a desktop notification the moment a card or todo with an explicit
 * due time is reached. Date-only due items are covered by the visual urgency
 * gradient instead — there's no single "moment" to notify at without a time.
 *
 * Each (item, dueDate, dueTime) triple notifies at most once; changing the
 * due date/time on an item naturally re-arms it, since that's a new key.
 */
export function useDueNotifications(state: AppState, enabled: boolean) {
  const notifiedRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("Notification" in window)) return;
    if (!notifiedRef.current) notifiedRef.current = loadNotified();

    function check() {
      const notified = notifiedRef.current!;
      const now = Date.now();
      let changed = false;

      for (const project of state.projects) {
        for (const card of project.cards) {
          if (card.column === "complete" || !card.dueDate || !card.dueTime) continue;
          const key = `card:${card.id}:${card.dueDate}:${card.dueTime}`;
          if (notified.has(key) || getDueTimestamp(card.dueDate, card.dueTime) > now) continue;
          const notification = new Notification(card.title, {
            body: `${project.name} — due now`,
            tag: key,
          });
          notification.onclick = () => window.focus();
          notified.add(key);
          changed = true;
        }
        for (const todo of project.todos) {
          if (todo.done || !todo.dueDate || !todo.dueTime) continue;
          const key = `todo:${todo.id}:${todo.dueDate}:${todo.dueTime}`;
          if (notified.has(key) || getDueTimestamp(todo.dueDate, todo.dueTime) > now) continue;
          const notification = new Notification(todo.text, {
            body: `${project.name} — due now`,
            tag: key,
          });
          notification.onclick = () => window.focus();
          notified.add(key);
          changed = true;
        }
      }

      if (changed) saveNotified(notified);
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [state, enabled]);
}
