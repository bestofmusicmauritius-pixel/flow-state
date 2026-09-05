"use client";

import { useEffect, useState } from "react";

/** Forces a re-render every intervalMs — used by components displaying a
 * running timer's live elapsed time, since the underlying trackedSeconds
 * only updates in state when the timer is stopped, not every second. */
export function useTick(active: boolean, intervalMs = 1000) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
}
