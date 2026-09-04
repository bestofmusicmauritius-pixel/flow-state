"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useAppStateContext } from "@/context/AppStateContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDueNotifications } from "@/hooks/useDueNotifications";
import { useDailyDigest } from "@/hooks/useDailyDigest";

type PermissionState = NotificationPermission | "unsupported";

export function NotificationControls() {
  const { state } = useAppStateContext();
  const [enabledPref, setEnabledPref] = useLocalStorage("flow-state:notifications-enabled", false);
  const [digestEnabledPref, setDigestEnabledPref] = useLocalStorage(
    "flow-state:digest-enabled",
    false
  );
  const [digestTime, setDigestTime] = useLocalStorage("flow-state:digest-time", "09:00");
  const [permission, setPermission] = useState<PermissionState>("default");
  const [digestMenuOpen, setDigestMenuOpen] = useState(false);
  const [draftDigestTime, setDraftDigestTime] = useState(digestTime);

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
  const digestActive = digestEnabledPref && permission === "granted";
  useDueNotifications(state, active);
  useDailyDigest(state, digestActive, digestTime);

  async function ensurePermission(): Promise<boolean> {
    if (permission === "unsupported" || permission === "denied") return false;
    if (permission === "granted") return true;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }

  async function handleToggle() {
    if (enabledPref) {
      setEnabledPref(false);
      return;
    }
    if (await ensurePermission()) setEnabledPref(true);
  }

  async function handleOpenDigestMenu() {
    if (permission === "unsupported" || permission === "denied") return;
    setDraftDigestTime(digestTime);
    setDigestMenuOpen(true);
  }

  async function handleSetDigest() {
    if (await ensurePermission()) {
      setDigestTime(draftDigestTime);
      setDigestEnabledPref(true);
    }
    setDigestMenuOpen(false);
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
    <div className="flex items-center gap-1">
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
          !disabled &&
            (active ? "text-accent" : "text-text-faint hover:text-text-primary hover:bg-bg-card")
        )}
      >
        {label}
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={handleOpenDigestMenu}
          disabled={disabled}
          title="One daily summary of what's due today and overdue — covers date-only items, which never get their own popup"
          className={clsx(
            "px-1.5 py-1 rounded-sm font-mono text-xs transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent",
            disabled && "opacity-40 cursor-not-allowed",
            !disabled &&
              (digestActive
                ? "text-accent"
                : "text-text-faint hover:text-text-primary hover:bg-bg-card")
          )}
        >
          {digestActive ? `[digest: ${digestTime}]` : "[digest: off]"}
        </button>
        {digestMenuOpen && (
          <>
            {/* z-index bumped above Dialog's z-50: this popover is nested
                inside the settings dialog, and needs to layer above it. */}
            <div className="fixed inset-0 z-[60]" onClick={() => setDigestMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-[70] flex flex-col gap-1.5 w-52 bg-bg-elevated border border-border-strong rounded-md shadow-[0_0_0_1px_rgba(255,181,69,0.08),0_8px_24px_rgba(0,0,0,0.5)] p-2">
              <p className="font-mono text-[11px] text-text-faint">
                {"// notify once a day at:"}
              </p>
              <input
                type="time"
                autoFocus
                value={draftDigestTime}
                onChange={(e) => setDraftDigestTime(e.target.value)}
                className="bg-bg-base border border-border rounded-sm px-1 py-0.5 text-text-primary font-mono text-[11px]"
              />
              <div className="flex justify-end gap-1.5">
                {digestEnabledPref && (
                  <button
                    type="button"
                    onClick={() => {
                      setDigestEnabledPref(false);
                      setDigestMenuOpen(false);
                    }}
                    className="px-1.5 py-0.5 rounded-sm border border-border text-text-faint hover:border-border-strong font-mono text-[11px]"
                  >
                    turn off
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSetDigest}
                  className="px-1.5 py-0.5 rounded-sm border border-accent/50 text-accent hover:bg-bg-card font-mono text-[11px]"
                >
                  set
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
