"use client";

import { useState } from "react";
import clsx from "clsx";
import { useAppStateContext } from "@/context/AppStateContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDueDateTime } from "@/lib/dueDate";
import { PRIORITY_COLOR, PRIORITY_TAG } from "@/lib/priority";
import { parseQuery, matchesQuery, type SearchMode } from "@/lib/search";
import { COLUMN_BRACKET, type Priority } from "@/types";

interface SearchResult {
  key: string;
  type: "card" | "todo";
  archived: boolean;
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description?: string;
  bracket: string;
  priority?: Priority;
  dueDate?: string;
  dueTime?: string;
}

interface SearchViewProps {
  onJumpToItem: (projectId: string, cardId: string | null) => void;
}

export function SearchView({ onJumpToItem }: SearchViewProps) {
  const { state, restoreCard, deleteArchivedCard } = useAppStateContext();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("all");
  const [includeArchived, setIncludeArchived] = useState(true);
  const [deleting, setDeleting] = useState<{ projectId: string; id: string; title: string } | null>(
    null
  );

  const trimmed = query.trim();

  let results: SearchResult[] = [];
  if (trimmed) {
    const parsed = parseQuery(trimmed, mode);
    const all: SearchResult[] = [];

    for (const project of state.projects) {
      for (const card of project.cards) {
        all.push({
          key: `card:${card.id}`,
          type: "card",
          archived: false,
          id: card.id,
          projectId: project.id,
          projectName: project.name,
          title: card.title,
          description: card.description,
          bracket: COLUMN_BRACKET[card.column],
          priority: card.priority,
          dueDate: card.dueDate,
          dueTime: card.dueTime,
        });
      }
      if (includeArchived) {
        for (const card of project.archivedCards) {
          all.push({
            key: `archived:${card.id}`,
            type: "card",
            archived: true,
            id: card.id,
            projectId: project.id,
            projectName: project.name,
            title: card.title,
            description: card.description,
            bracket: COLUMN_BRACKET[card.column],
            priority: card.priority,
            dueDate: card.dueDate,
            dueTime: card.dueTime,
          });
        }
      }
      for (const todo of project.todos) {
        all.push({
          key: `todo:${todo.id}`,
          type: "todo",
          archived: false,
          id: todo.id,
          projectId: project.id,
          projectName: project.name,
          title: todo.text,
          bracket: todo.done ? "[x]" : "[ ]",
          priority: todo.priority,
          dueDate: todo.dueDate,
          dueTime: todo.dueTime,
        });
      }
    }

    results = all.filter((item) =>
      matchesQuery(`${item.title} ${item.description ?? ""} ${item.projectName}`, parsed)
    );
  }

  const activeResults = results.filter((r) => !r.archived);
  const archivedResults = results.filter((r) => r.archived);

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
          <EmptyState>$ type to search across every project</EmptyState>
        ) : results.length === 0 ? (
          <EmptyState>$ no results</EmptyState>
        ) : (
          <div className="flex flex-col gap-6">
            {activeResults.length > 0 && (
              <div>
                <h2 className="font-mono text-xs text-text-faint mb-2 pb-1 border-b border-border">
                  results ({activeResults.length})
                </h2>
                <div className="flex flex-col">
                  {activeResults.map((item) => (
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

            {archivedResults.length > 0 && (
              <div>
                <h2 className="font-mono text-xs text-text-faint mb-2 pb-1 border-b border-border">
                  archived ({archivedResults.length})
                </h2>
                <div className="flex flex-col">
                  {archivedResults.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-2 py-1.5 px-1 rounded-sm font-mono text-sm"
                    >
                      <span className="text-text-faint shrink-0">{item.bracket}</span>
                      <span className="text-text-faint shrink-0">{item.projectName}</span>
                      <span className="text-text-faint shrink-0">·</span>
                      {item.priority && (
                        <span className={clsx("shrink-0", PRIORITY_COLOR[item.priority])}>
                          {PRIORITY_TAG[item.priority]}
                        </span>
                      )}
                      <span className="text-text-muted truncate flex-1">{item.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleting({
                            projectId: item.projectId,
                            id: item.id,
                            title: item.title,
                          })
                        }
                      >
                        delete forever
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreCard(item.projectId, item.id)}
                      >
                        restore
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete Forever"
        message={`Permanently delete "${deleting?.title}"? This cannot be undone — it won't be recoverable from the archive anymore.`}
        onConfirm={() => {
          if (deleting) deleteArchivedCard(deleting.projectId, deleting.id);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
