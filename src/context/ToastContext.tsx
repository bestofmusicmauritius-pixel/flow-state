"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface Toast {
  id: string;
  message: string;
  onUndo?: () => void;
}

interface ToastContextValue {
  showToast: (message: string, onUndo?: () => void) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const TOAST_DURATION_MS = 7000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, onUndo?: () => void) => {
      const id = `toast-${counter.current++}`;
      setToasts((prev) => [...prev, { id, message, onUndo }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 bg-bg-elevated border border-border-strong rounded-md px-3 py-2 shadow-[0_0_0_1px_rgba(255,181,69,0.08),0_8px_24px_rgba(0,0,0,0.5)] font-mono text-sm"
          >
            <span className="text-text-primary">{t.message}</span>
            {t.onUndo && (
              <button
                type="button"
                onClick={() => {
                  t.onUndo?.();
                  dismiss(t.id);
                }}
                className="text-accent hover:text-accent-hover font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm px-1"
              >
                undo
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
