"use client";

import { useAppStateContext } from "@/context/AppStateContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArchivedCardRow } from "@/components/archive/ArchivedCardRow";

export function ArchiveView() {
  const { state } = useAppStateContext();

  const groups = state.projects
    .map((project) => ({ project, cards: project.archivedCards }))
    .filter((group) => group.cards.length > 0);

  if (groups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState>$ archive is empty</EmptyState>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {groups.map(({ project, cards }) => (
          <div key={project.id}>
            <h2 className="font-mono text-xs text-text-faint mb-2 pb-1 border-b border-border">
              {project.name} ({cards.length})
            </h2>
            <div className="flex flex-col">
              {cards.map((card) => (
                <ArchivedCardRow key={card.id} projectId={project.id} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
