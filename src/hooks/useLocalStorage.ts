"use client";

import { useEffect, useState } from "react";

/** SSR-safe localStorage-backed state: starts at initialValue, hydrates on mount. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      // Reading localStorage (an external system unavailable during SSR) after mount,
      // rather than during render, is what avoids a server/client hydration mismatch here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // corrupt value — keep initialValue
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded or unavailable — in-memory state still works
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}
