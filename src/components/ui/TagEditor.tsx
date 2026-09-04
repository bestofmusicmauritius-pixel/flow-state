"use client";

import { useMemo, useState } from "react";
import { useAppStateContext } from "@/context/AppStateContext";
import { getAllTags, normalizeTag } from "@/lib/tags";

interface TagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  autoFocus?: boolean;
}

export function TagEditor({ tags, onChange, autoFocus }: TagEditorProps) {
  const { state } = useAppStateContext();
  const [draft, setDraft] = useState("");

  const allTags = useMemo(() => getAllTags(state), [state]);
  const suggestions = useMemo(() => {
    const needle = normalizeTag(draft);
    if (!needle) return [];
    return allTags.filter((tag) => tag.includes(needle) && !tags.includes(tag)).slice(0, 6);
  }, [allTags, draft, tags]);

  function commit(raw: string) {
    const tag = normalizeTag(raw);
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
  }

  function addDraft() {
    commit(draft);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 font-mono text-xs px-1.5 py-0.5 rounded-sm border border-border text-text-muted"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              className="text-text-faint hover:text-alert"
            >
              ×
            </button>
          </span>
        ))}
        <input
          autoFocus={autoFocus}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={addDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addDraft();
            } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          placeholder="add tag..."
          className="bg-transparent border-none outline-none font-mono text-xs text-text-primary placeholder:text-text-faint w-24 py-0.5"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              // mousedown (not click) + preventDefault so the input never
              // blurs on this click — otherwise onBlur's addDraft() would
              // fire first and commit the raw typed text instead of this
              // suggestion.
              onMouseDown={(e) => {
                e.preventDefault();
                commit(tag);
                setDraft("");
              }}
              className="font-mono text-[11px] px-1.5 py-0.5 rounded-sm border border-border text-text-faint hover:border-accent hover:text-accent transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
