"use client";

import clsx from "clsx";
import { useTick } from "@/hooks/useTick";
import { elapsedSeconds, formatDuration } from "@/lib/format";

interface CardTimerProps {
  trackedSeconds?: number;
  timerStartedAt?: string;
  onStart: () => void;
  onStop: () => void;
  onReset?: () => void;
  size?: "sm" | "md";
}

export function CardTimer({
  trackedSeconds,
  timerStartedAt,
  onStart,
  onStop,
  onReset,
  size = "sm",
}: CardTimerProps) {
  const running = Boolean(timerStartedAt);
  useTick(running);

  const liveSeconds =
    (trackedSeconds ?? 0) + (running ? elapsedSeconds(timerStartedAt!, new Date().toISOString()) : 0);

  const textSize = size === "sm" ? "text-[11px]" : "text-xs";

  return (
    <span className="inline-flex items-center gap-1 font-mono">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (running) onStop();
          else onStart();
        }}
        aria-label={running ? "Pause timer" : "Start timer"}
        className={clsx(
          "leading-none",
          running ? "text-accent" : "text-text-faint hover:text-accent",
          textSize
        )}
      >
        {running ? "⏸" : "▶"}
      </button>
      {liveSeconds > 0 && (
        <span className={clsx(running ? "text-accent" : "text-text-faint", textSize)}>
          {formatDuration(liveSeconds)}
        </span>
      )}
      {onReset && liveSeconds > 0 && !running && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          aria-label="Reset timer"
          className={clsx("text-text-faint hover:text-alert leading-none", textSize)}
        >
          ×
        </button>
      )}
    </span>
  );
}
