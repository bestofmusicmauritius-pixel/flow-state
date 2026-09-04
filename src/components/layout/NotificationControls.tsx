"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useAppStateContext } from "@/context/AppStateContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDueNotifications } from "@/hooks/useDueNotifications";

type PermissionState = NotificationPermission | "unsupported";

export function NotificationControls() {
  const { state } = useAppStateContext();
  const [enabledPref, setEnabledPref] = useLocalStorage("flow-state:notifications-enabled", false);
  const [permission, setPermission] = useState<PermissionState>("default");

  useEffect(() => {
    // Reading Notification.permission (an external, browser-only API unavailable
    // during SSR) after mount, rather than during render, is what avoids a
    // server/client hydration mismatch here.
    if (typeof window === "undefined" || !("Notification" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const active = enabledPref && permission === "granted";
  useDueNotifications(state, active);

  async function handleToggle() {
    if (permission === "unsupported" || permission === "denied") return;

    if (enabledPref) {
      setEnabledPref(false);
      return;
    }

    if (permission === "default") {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") setEnabledPref(true);
      return;
    }

    setEnabledPref(true);
  }

  const label =
    permission === "unsupported"
      ? "[notify: unsupported]"
      : permission === "denied"
        ? "[notify: blocked]"
        : active
          ? "[notify: on]"
          : "[notify: off]";

  const disabled = permission === "unsupported" || permission === "denied";

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      title={
        permission === "denied"
          ? "Notifications are blocked — allow them for this site in your browser settings"
          : "Desktop notifications only fire while flow-state is open in a tab"
      }
      className={clsx(
        "px-1.5 py-1 rounded-sm font-mono text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent",
        disabled && "opacity-40 cursor-not-allowed",
        !disabled && (active ? "text-accent" : "text-text-faint hover:text-text-primary hover:bg-bg-card")
      )}
    >
      {label}
    </button>
  );
}
