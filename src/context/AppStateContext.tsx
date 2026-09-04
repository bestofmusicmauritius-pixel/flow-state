"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAppState, type UseAppState } from "@/hooks/useAppState";

const AppStateContext = createContext<UseAppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const appState = useAppState();
  return (
    <AppStateContext.Provider value={appState}>{children}</AppStateContext.Provider>
  );
}

export function useAppStateContext(): UseAppState {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppStateContext must be used within an AppStateProvider");
  }
  return context;
}
