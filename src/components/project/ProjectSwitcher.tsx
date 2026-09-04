"use client";

import { useState } from "react";
import { useAppStateContext } from "@/context/AppStateContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProjectDialog } from "@/components/project/ProjectDialog";

export function ProjectSwitcher() {
  const {
    state,
    activeProject,
    createProject,
    renameProject,
    deleteProject,
    undoDeleteProject,
    setActiveProject,
  } = useAppStateContext();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-1.5 px-1.5 py-1 rounded-sm hover:bg-bg-card transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <span className="font-mono text-sm text-text-primary">
          {activeProject?.name ?? "no project"}
        </span>
        <span className="font-mono text-[10px] text-text-faint">
          {menuOpen ? "▴" : "▾"}
        </span>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-bg-elevated border border-border-strong rounded-md shadow-[0_0_0_1px_rgba(255,181,69,0.08),0_8px_24px_rgba(0,0,0,0.5)] py-1">
            {state.projects.map((project) => (
              <div
                key={project.id}
                className="group flex items-center justify-between px-2 py-1.5 hover:bg-bg-card"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveProject(project.id);
                    setMenuOpen(false);
                  }}
                  className="flex-1 text-left font-mono text-sm text-text-primary truncate"
                >
                  {project.id === activeProject?.id ? (
                    <span className="text-accent mr-1">›</span>
                  ) : null}
                  {project.name}
                </button>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                  <IconButton
                    aria-label={`Rename ${project.name}`}
                    onClick={() => {
                      setRenameTarget({ id: project.id, name: project.name });
                      setMenuOpen(false);
                    }}
                  >
                    ✎
                  </IconButton>
                  <IconButton
                    aria-label={`Delete ${project.name}`}
                    onClick={() => {
                      setDeleteTarget({ id: project.id, name: project.name });
                      setMenuOpen(false);
                    }}
                  >
                    ×
                  </IconButton>
                </div>
              </div>
            ))}
            <div className="border-t border-border mt-1 pt-1 px-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setCreateOpen(true);
                  setMenuOpen(false);
                }}
              >
                + New project
              </Button>
            </div>
          </div>
        </>
      )}

      <ProjectDialog
        key={createOpen ? "create-open" : "create-closed"}
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={(name) => createProject(name)}
      />

      <ProjectDialog
        key={renameTarget?.id ?? "none"}
        open={renameTarget !== null}
        mode="rename"
        initialName={renameTarget?.name}
        onClose={() => setRenameTarget(null)}
        onSubmit={(name) => renameTarget && renameProject(renameTarget.id, name)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Project"
        message={`Delete "${deleteTarget?.name}" and everything in it? This cannot be undone once the undo option below expires.`}
        onConfirm={() => {
          if (deleteTarget) {
            const project = state.projects.find((p) => p.id === deleteTarget.id);
            deleteProject(deleteTarget.id);
            if (project) {
              showToast(`"${project.name}" deleted`, () => undoDeleteProject(project));
            }
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
