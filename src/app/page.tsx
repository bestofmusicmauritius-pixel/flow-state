"use client";

import { useState } from "react";
import { useAppStateContext } from "@/context/AppStateContext";
import { TopBar, type View } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { AgendaView } from "@/components/agenda/AgendaView";
import { SearchView } from "@/components/search/SearchView";
import { ArchiveView } from "@/components/archive/ArchiveView";
import { ShortcutsHelpDialog } from "@/components/layout/ShortcutsHelpDialog";
import { ProjectDialog } from "@/components/project/ProjectDialog";
import { Button } from "@/components/ui/Button";
import { BackupControls } from "@/components/layout/BackupControls";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function Home() {
  const { state, activeProject, createProject, setActiveProject } = useAppStateContext();
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<View>("board");
  const [pendingOpenCardId, setPendingOpenCardId] = useState<string | null>(null);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  useKeyboardShortcuts({
    "/": () => setView("search"),
    b: () => setView("board"),
    a: () => setView("agenda"),
    n: () => {
      setView("board");
      setPendingCreate(true);
    },
    "?": () => setShowShortcutsHelp(true),
  });

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
        <ShortcutsHelpDialog
          open={showShortcutsHelp}
          onClose={() => setShowShortcutsHelp(false)}
        />
      </main>
    );
  }

  function jumpToItem(projectId: string, cardId: string | null) {
    setActiveProject(projectId);
    setPendingOpenCardId(cardId);
    setView("board");
  }

  return (
    <main className="h-full flex flex-col">
      <TopBar view={view} onChangeView={setView} />
      {view === "board" && (
        <div className="flex flex-1 min-h-0">
          <KanbanBoard
            openCardId={pendingOpenCardId}
            onCardOpened={() => setPendingOpenCardId(null)}
            requestCreate={pendingCreate}
            onCreateRequested={() => setPendingCreate(false)}
          />
          {activeProject && <Sidebar />}
        </div>
      )}
      {view === "agenda" && <AgendaView onJumpToItem={jumpToItem} />}
      {view === "search" && <SearchView onJumpToItem={jumpToItem} />}
      {view === "archive" && <ArchiveView />}
      <ShortcutsHelpDialog open={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
    </main>
  );
}
