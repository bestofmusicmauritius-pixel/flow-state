"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const WORK_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

type Phase = "work" | "break";

interface PomodoroState {
  phase: Phase;
  remainingSeconds: number;
  running: boolean;
}

const initialState: PomodoroState = { phase: "work", remainingSeconds: WORK_SECONDS, running: false };

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function notify(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  const notification = new Notification(title, {
    body,
    requireInteraction: true,
    tag: "flow-state-pomodoro",
  });
  notification.onclick = () => window.focus();
}

/** Session-only — an active pomodoro deliberately doesn't survive a reload,
 * same as closing a physical kitchen timer. */
export function PomodoroWidget() {
  const [pomo, setPomo] = useState<PomodoroState>(initialState);
  const [open, setOpen] = useState(false);
  const isFirstPhaseRender = useRef(true);
  // Set right before a manual reset/skip so the phase-change effect below
  // can tell "the interval just completed a real session" apart from "the
  // user reset/skipped it themselves" — only the former deserves a notification.
  const suppressNotifyRef = useRef(false);

  useEffect(() => {
    if (!pomo.running) return;
    const interval = setInterval(() => {
      setPomo((prev) => {
        if (!prev.running) return prev;
        if (prev.remainingSeconds > 1) {
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        }
        const nextPhase: Phase = prev.phase === "work" ? "break" : "work";
        return {
          phase: nextPhase,
          remainingSeconds: nextPhase === "work" ? WORK_SECONDS : BREAK_SECONDS,
          running: true,
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomo.running]);

  useEffect(() => {
    if (isFirstPhaseRender.current) {
      isFirstPhaseRender.current = false;
      return;
    }
    if (suppressNotifyRef.current) {
      suppressNotifyRef.current = false;
      return;
    }
    notify(
      pomo.phase === "break" ? "Work session complete" : "Break's over",
      pomo.phase === "break" ? "Time for a 5-minute break." : "Back to a 25-minute focus session."
    );
  }, [pomo.phase]);

  function toggleRunning() {
    setPomo((prev) => ({ ...prev, running: !prev.running }));
  }

  function reset() {
    suppressNotifyRef.current = true;
    setPomo({ ...initialState });
  }

  function skip() {
    suppressNotifyRef.current = true;
    setPomo((prev) => {
      const nextPhase: Phase = prev.phase === "work" ? "break" : "work";
      return {
        phase: nextPhase,
        remainingSeconds: nextPhase === "work" ? WORK_SECONDS : BREAK_SECONDS,
        running: prev.running,
      };
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Pomodoro timer"
        className={clsx(
          "px-1.5 py-1 rounded-sm font-mono text-xs transition-colors",
          pomo.running
            ? pomo.phase === "work"
              ? "text-accent"
              : "text-text-muted"
            : "text-text-faint hover:text-text-primary hover:bg-bg-card"
        )}
      >
        [pomo {formatClock(pomo.remainingSeconds)}]
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 flex flex-col items-center gap-2 w-48 bg-bg-elevated border border-border-strong rounded-md shadow-[0_0_0_1px_rgba(255,181,69,0.08),0_8px_24px_rgba(0,0,0,0.5)] p-3">
            <p className="font-mono text-[11px] text-text-faint">
              {pomo.phase === "work" ? "// focus session" : "// break"}
            </p>
            <p
              className={clsx(
                "font-mono text-2xl tabular-nums",
                pomo.phase === "work" ? "text-accent" : "text-text-muted"
              )}
            >
              {formatClock(pomo.remainingSeconds)}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleRunning}
                className="px-2 py-1 rounded-sm border border-accent/50 text-accent hover:bg-bg-card font-mono text-[11px]"
              >
                {pomo.running ? "pause" : "start"}
              </button>
              <button
                type="button"
                onClick={skip}
                className="px-2 py-1 rounded-sm border border-border text-text-faint hover:border-border-strong hover:text-text-primary font-mono text-[11px]"
              >
                skip
              </button>
              <button
                type="button"
                onClick={reset}
                className="px-2 py-1 rounded-sm border border-border text-text-faint hover:border-border-strong hover:text-text-primary font-mono text-[11px]"
              >
                reset
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
