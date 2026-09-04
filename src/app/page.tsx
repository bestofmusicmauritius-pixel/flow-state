"use client";

import { useState } from "react";
import { useAppStateContext } from "@/context/AppStateContext";
import { TopBar, type View } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { AgendaView } from "@/components/agenda/AgendaView";
import { ProjectDialog } from "@/components/project/ProjectDialog";
import { Button } from "@/components/ui/Button";
import { BackupControls } from "@/components/layout/BackupControls";

export default function Home() {
  const { state, activeProject, createProject, setActiveProject } = useAppStateContext();
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<View>("board");

  if (state.projects.length === 0) {
    return (
      <main className="h-full flex flex-col items-center justify-center gap-4 px-4">
        <p className="font-mono text-sm text-text-faint">$ no projects yet</p>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          Create your first project
        </Button>
        <p className="font-mono text-xs text-text-faint">or</p>
        <BackupControls showExport={false} />
        <ProjectDialog
          key={createOpen ? "create-open" : "create-closed"}
          open={createOpen}
          mode="create"
          onClose={() => setCreateOpen(false)}
          onSubmit={(name) => createProject(name)}
        />
      </main>
    );
  }

  return (
    <main className="h-full flex flex-col">
      <TopBar view={view} onChangeView={setView} />
      {view === "board" ? (
        <div className="flex flex-1 min-h-0">
          <KanbanBoard />
          {activeProject && <Sidebar />}
        </div>
      ) : (
        <AgendaView
          onJumpToProject={(projectId) => {
            setActiveProject(projectId);
            setView("board");
          }}
        />
      )}
    </main>
  );
}
