"use client";

import { useEffect, useRef } from "react";
import { getDueUrgency } from "@/lib/dueDate";
import type { AppState } from "@/types";

const LAST_DIGEST_KEY = "flow-state:last-digest-date";
const CHECK_INTERVAL_MS = 60_000;

function todayISO(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function loadLastDigestDate(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(LAST_DIGEST_KEY);
  } catch {
    return null;
  }
}

function saveLastDigestDate(date: string) {
  try {
    window.localStorage.setItem(LAST_DIGEST_KEY, date);
  } catch {
    // ignore
  }
}

/**
 * A once-a-day summary notification at a configured time, covering exactly
 * what useDueNotifications can't: date-only due items, which have no single
 * precise moment to alert at (that's why they don't get their own popup).
 * This fires once regardless — "3 due today, 1 overdue" — whether those
 * items have a time attached or not, the same way Things/Todoist/Reminders
 * give date-only items a daily heads-up instead of a moment-specific alert.
 *
 * Fires the first check on/after digestTime each day, tracked by date (not
 * a timer armed for the exact minute) — so it still fires correctly even if
 * the app wasn't open exactly at digestTime, as long as it's open sometime
 * after that on the same day. Skips silently (but still marks the day as
 * done) when there's nothing overdue or due today, so it never nags with
 * an empty "0 things due" notification.
 */
export function useDailyDigest(state: AppState, enabled: boolean, digestTime: string) {
  const lastFiredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("Notification" in window)) return;
    if (lastFiredRef.current === null) lastFiredRef.current = loadLastDigestDate();

    function check() {
      const today = todayISO();
      if (lastFiredRef.current === today) return;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [digestHour, digestMinute] = digestTime.split(":").map(Number);
      if (currentMinutes < digestHour * 60 + digestMinute) return;

      let overdue = 0;
      let dueToday = 0;
      for (const project of state.projects) {
        for (const card of project.cards) {
          if (card.column === "complete" || !card.dueDate) continue;
          const urgency = getDueUrgency(card.dueDate, card.dueTime, false);
          if (urgency === "overdue") overdue++;
          else if (urgency === "today") dueToday++;
        }
        for (const todo of project.todos) {
          if (todo.done || !todo.dueDate) continue;
          const urgency = getDueUrgency(todo.dueDate, todo.dueTime, false);
          if (urgency === "overdue") overdue++;
          else if (urgency === "today") dueToday++;
        }
      }

      if (overdue > 0 || dueToday > 0) {
        const parts: string[] = [];
        if (dueToday > 0) parts.push(`${dueToday} due today`);
        if (overdue > 0) parts.push(`${overdue} overdue`);
        const notification = new Notification("flow-state — daily digest", {
          body: parts.join(", "),
          tag: `digest-${today}`,
          requireInteraction: true,
        });
        notification.onclick = () => window.focus();
      }

      lastFiredRef.current = today;
      saveLastDigestDate(today);
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [state, enabled, digestTime]);
}
