"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useAppStateContext } from "@/context/AppStateContext";
import { ArchivedCardRow } from "@/components/archive/ArchivedCardRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { formatDueDateTime } from "@/lib/dueDate";
import { PRIORITY_COLOR, PRIORITY_TAG } from "@/lib/priority";
import { parseQuery, matchesQuery, extractSnippet, type SearchMode } from "@/lib/search";
import { getAllTags } from "@/lib/tags";
import { COLUMN_BRACKET, type KanbanCard, type Priority } from "@/types";

interface SearchResult {
  key: string;
  type: "card" | "todo";
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description?: string;
  bracket: string;
  priority?: Priority;
  dueDate?: string;
  dueTime?: string;
  tags?: string[];
}

interface NoteResult {
  key: string;
  projectId: string;
  projectName: string;
  snippet: string;
}

interface ArchivedResult {
  key: string;
  projectId: string;
  projectName: string;
  card: KanbanCard;
}

interface SearchViewProps {
  onJumpToItem: (projectId: string, cardId: string | null) => void;
}

export function SearchView({ onJumpToItem }: SearchViewProps) {
  const { state } = useAppStateContext();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("all");
  const [includeArchived, setIncludeArchived] = useState(true);

  const trimmed = query.trim();
  const allTags = useMemo(() => getAllTags(state), [state]);

  let results: SearchResult[] = [];
  const noteResults: NoteResult[] = [];
  const archivedResults: ArchivedResult[] = [];

  if (trimmed) {
    const parsed = parseQuery(trimmed, mode);
    const all: SearchResult[] = [];

    for (const project of state.projects) {
      for (const card of project.cards) {
        all.push({
          key: `card:${card.id}`,
          type: "card",
          id: card.id,
          projectId: project.id,
          projectName: project.name,
          title: card.title,
          description: card.description,
          bracket: COLUMN_BRACKET[card.column],
          priority: card.priority,
          dueDate: card.dueDate,
          dueTime: card.dueTime,
          tags: card.tags,
        });
      }
      for (const todo of project.todos) {
        all.push({
          key: `todo:${todo.id}`,
          type: "todo",
          id: todo.id,
          projectId: project.id,
          projectName: project.name,
          title: todo.text,
          bracket: todo.done ? "[x]" : "[ ]",
          priority: todo.priority,
          dueDate: todo.dueDate,
          dueTime: todo.dueTime,
          tags: todo.tags,
        });
      }
      if (project.notes.trim() && matchesQuery(project.notes, parsed)) {
        noteResults.push({
          key: `notes:${project.id}`,
          projectId: project.id,
          projectName: project.name,
          snippet: extractSnippet(project.notes, parsed),
        });
      }
      if (includeArchived) {
        for (const card of project.archivedCards) {
          const haystack = `${card.title} ${card.description ?? ""} ${project.name} ${(card.tags ?? []).join(" ")}`;
          if (matchesQuery(haystack, parsed)) {
            archivedResults.push({
              key: `archived:${card.id}`,
              projectId: project.id,
              projectName: project.name,
              card,
            });
          }
        }
      }
    }

    results = all.filter((item) =>
      matchesQuery(
        `${item.title} ${item.description ?? ""} ${item.projectName} ${(item.tags ?? []).join(" ")}`,
        parsed
      )
    );
  }

  const nothingFound =
    trimmed && results.length === 0 && noteResults.length === 0 && archivedResults.length === 0;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={'search... try "exact phrase", -exclude, word OR word'}
        />
        <div className="flex items-center gap-4 font-mono text-xs">
          <div className="flex items-center gap-1">
            <span className="text-text-faint mr-1">match:</span>
            <button
              type="button"
              onClick={() => setMode("all")}
              className={clsx(
                "px-1.5 py-0.5 rounded-sm transition-colors",
                mode === "all"
                  ? "text-text-primary bg-bg-card"
                  : "text-text-faint hover:text-text-muted"
              )}
            >
              all words
            </button>
            <button
              type="button"
              onClick={() => setMode("any")}
              className={clsx(
                "px-1.5 py-0.5 rounded-sm transition-colors",
                mode === "any"
                  ? "text-text-primary bg-bg-card"
                  : "text-text-faint hover:text-text-muted"
              )}
            >
              any word
            </button>
          </div>
          <label className="flex items-center gap-1.5 text-text-faint cursor-pointer">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="accent-accent"
            />
            include archived
          </label>
        </div>

        {!trimmed ? (
          allTags.length > 0 ? (
            <div>
              <p className="font-mono text-xs text-text-faint mb-2">{"// browse by tag"}</p>
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(`#${tag}`)}
                    className="font-mono text-xs px-1.5 py-0.5 rounded-sm border border-border text-text-muted hover:border-border-strong hover:text-text-primary transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState>$ type to search across every project</EmptyState>
          )
        ) : nothingFound ? (
          <EmptyState>$ no results</EmptyState>
        ) : (
          <div className="flex flex-col gap-6">
            {results.length > 0 && (
              <div>
                <h2 className="font-mono text-xs text-text-faint mb-2 pb-1 border-b border-border">
                  results ({results.length})
                </h2>
                <div className="flex flex-col">
                  {results.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        onJumpToItem(item.projectId, item.type === "card" ? item.id : null)
                      }
                      className="flex items-center gap-2 py-1.5 px-1 rounded-sm hover:bg-bg-card transition-colors text-left font-mono text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                    >
                      <span className="text-text-muted shrink-0">{item.bracket}</span>
                      <span className="text-text-faint shrink-0">{item.projectName}</span>
                      <span className="text-text-faint shrink-0">·</span>
                      {item.priority && (
                        <span className={clsx("shrink-0", PRIORITY_COLOR[item.priority])}>
                          {PRIORITY_TAG[item.priority]}
                        </span>
                      )}
                      <span className="text-text-primary truncate flex-1">{item.title}</span>
                      {item.tags && item.tags.length > 0 && (
                        <span className="shrink-0 text-xs text-text-muted">
                          {item.tags.map((tag) => `#${tag}`).join(" ")}
                        </span>
                      )}
                      {item.dueDate && (
                        <span className="shrink-0 text-xs text-text-faint">
                          {formatDueDateTime(item.dueDate, item.dueTime)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {noteResults.length > 0 && (
              <div>
                <h2 className="font-mono text-xs text-text-faint mb-2 pb-1 border-b border-border">
                  notes ({noteResults.length})
                </h2>
                <div className="flex flex-col">
                  {noteResults.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onJumpToItem(item.projectId, null)}
                      className="flex flex-col items-start gap-0.5 py-1.5 px-1 rounded-sm hover:bg-bg-card transition-colors text-left font-mono text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                    >
                      <span className="text-text-faint text-xs">{item.projectName}</span>
                      <span className="text-text-primary">{item.snippet}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {archivedResults.length > 0 && (
              <div>
                <h2 className="font-mono text-xs text-text-faint mb-2 pb-1 border-b border-border">
                  archived ({archivedResults.length})
                </h2>
                <div className="flex flex-col">
                  {archivedResults.map((item) => (
                    <ArchivedCardRow
                      key={item.key}
                      projectId={item.projectId}
                      projectName={item.projectName}
                      card={item.card}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
