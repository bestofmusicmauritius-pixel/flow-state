"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStateContext } from "@/context/AppStateContext";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { Textarea } from "@/components/ui/Textarea";

export function NotesPanel() {
  const { activeProject, updateNotes } = useAppStateContext();
  const [text, setText] = useState(activeProject?.notes ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const lastProjectId = useRef(activeProject?.id);

  useEffect(() => {
    if (activeProject && activeProject.id !== lastProjectId.current) {
      setText(activeProject.notes);
      setStatus("idle");
      lastProjectId.current = activeProject.id;
    }
  }, [activeProject]);

  const debouncedSave = useDebouncedCallback((value: string) => {
    updateNotes(value);
    setStatus("saved");
  }, 500);

  if (!activeProject) return null;

  function handleChange(value: string) {
    setText(value);
    setStatus("saving");
    debouncedSave(value);
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <h2 className="font-mono text-xs text-text-faint">{"// notes"}</h2>
        {status !== "idle" && (
          <span className="font-mono text-[11px] text-text-faint">
            {status === "saving" ? "saving…" : "saved"}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0 px-3 pb-3">
        <Textarea
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="// jot something down..."
          className="h-full font-mono text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}
