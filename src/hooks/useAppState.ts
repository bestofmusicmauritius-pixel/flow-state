"use client";

import { useCallback, useEffect, useState } from "react";
import { createId } from "@/lib/id";
import { moveCardToColumn, nextOrderInColumn, reorderCardsInColumn } from "@/lib/reorder";
import { createEmptyProject, seedState } from "@/lib/seed";
import { localStorageStore } from "@/lib/storage";
import type { AppState, ColumnId, KanbanCard, Priority, Project, TodoItem } from "@/types";

export function useAppState() {
  const [state, setState] = useState<AppState>(seedState);
  // Deliberately useState, not useRef: a ref mutates instantly and is visible to every
  // effect in the same passive-effects pass, so the save effect below could see
  // hydrated=true while still reading the pre-load `state` closure (the seed default)
  // and overwrite real localStorage data with it. useState ties "hydrated" to the same
  // render as the loaded `state`, so the save effect can't observe them out of sync.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage (an external system unavailable during SSR) after mount,
    // rather than during render, is what avoids a server/client hydration mismatch here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(localStorageStore.load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorageStore.save(state);
  }, [state, hydrated]);

  const activeProject = state.projects.find((p) => p.id === state.activeProjectId) ?? null;

  const updateActiveProject = useCallback((updater: (project: Project) => Project) => {
    setState((prev) => {
      if (!prev.activeProjectId) return prev;
      const now = new Date().toISOString();
      return {
        ...prev,
        projects: prev.projects.map((project) =>
          project.id === prev.activeProjectId
            ? { ...updater(project), updatedAt: now }
            : project
        ),
      };
    });
  }, []);

  // Like updateActiveProject, but targets any project by id — needed for
  // archive/restore, which can be triggered from cross-project views
  // (search, agenda) where the target project isn't necessarily active.
  const updateProjectById = useCallback(
    (projectId: string, updater: (project: Project) => Project) => {
      setState((prev) => {
        const now = new Date().toISOString();
        return {
          ...prev,
          projects: prev.projects.map((project) =>
            project.id === projectId ? { ...updater(project), updatedAt: now } : project
          ),
        };
      });
    },
    []
  );

  // --- Projects ---

  const createProject = useCallback((name: string) => {
    const project = createEmptyProject(name.trim() || "Untitled Project");
    setState((prev) => ({
      projects: [...prev.projects, project],
      activeProjectId: project.id,
    }));
  }, []);

  const renameProject = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((project) =>
        project.id === id
          ? { ...project, name: trimmed, updatedAt: new Date().toISOString() }
          : project
      ),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState((prev) => {
      const remaining = prev.projects.filter((project) => project.id !== id);
      const activeProjectId =
        prev.activeProjectId === id
          ? (remaining[0]?.id ?? null)
          : prev.activeProjectId;
      return { projects: remaining, activeProjectId };
    });
  }, []);

  const setActiveProject = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeProjectId: id }));
  }, []);

  /** Re-inserts a whole deleted project and makes it active again — the
   * undo half of deleteProject. */
  const undoDeleteProject = useCallback((project: Project) => {
    setState((prev) => ({
      projects: [...prev.projects, project],
      activeProjectId: project.id,
    }));
  }, []);

  // --- Backup ---

  const replaceState = useCallback((next: AppState) => {
    const activeProjectId = next.projects.some((p) => p.id === next.activeProjectId)
      ? next.activeProjectId
      : (next.projects[0]?.id ?? null);
    setState({ projects: next.projects, activeProjectId });
  }, []);

  // --- Kanban cards ---

  const addCard = useCallback(
    (
      column: ColumnId,
      title: string,
      options?: {
        description?: string;
        priority?: Priority;
        dueDate?: string;
        dueTime?: string;
      }
    ) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      updateActiveProject((project) => {
        const now = new Date().toISOString();
        const card = {
          id: createId(),
          title: trimmed,
          description: options?.description?.trim() || undefined,
          column,
          order: nextOrderInColumn(project.cards, column),
          priority: options?.priority,
          dueDate: options?.dueDate,
          dueTime: options?.dueDate ? options?.dueTime : undefined,
          createdAt: now,
          updatedAt: now,
        };
        return { ...project, cards: [...project.cards, card] };
      });
    },
    [updateActiveProject]
  );

  const updateCard = useCallback(
    (
      cardId: string,
      patch: {
        title?: string;
        description?: string;
        priority?: Priority | null;
        dueDate?: string | null;
        dueTime?: string | null;
      }
    ) => {
      updateActiveProject((project) => ({
        ...project,
        cards: project.cards.map((card) =>
          card.id === cardId
            ? {
                ...card,
                ...(patch.title !== undefined ? { title: patch.title.trim() || card.title } : {}),
                ...(patch.description !== undefined
                  ? { description: patch.description.trim() || undefined }
                  : {}),
                ...(patch.priority !== undefined
                  ? { priority: patch.priority ?? undefined }
                  : {}),
                ...(patch.dueDate !== undefined
                  ? {
                      dueDate: patch.dueDate ?? undefined,
                      dueTime: patch.dueDate ? (patch.dueTime ?? undefined) : undefined,
                    }
                  : patch.dueTime !== undefined
                    ? { dueTime: patch.dueTime ?? undefined }
                    : {}),
                updatedAt: new Date().toISOString(),
              }
            : card
        ),
      }));
    },
    [updateActiveProject]
  );

  const deleteCard = useCallback(
    (cardId: string) => {
      updateActiveProject((project) => ({
        ...project,
        cards: project.cards.filter((card) => card.id !== cardId),
      }));
    },
    [updateActiveProject]
  );

  /** Re-inserts a card exactly as it was — the undo half of deleteCard. */
  const undoDeleteCard = useCallback(
    (projectId: string, card: KanbanCard) => {
      updateProjectById(projectId, (project) => ({
        ...project,
        cards: [...project.cards, card],
      }));
    },
    [updateProjectById]
  );

  const moveCard = useCallback(
    (cardId: string, toColumn: ColumnId, toIndex: number) => {
      updateActiveProject((project) => ({
        ...project,
        cards: moveCardToColumn(project.cards, cardId, toColumn, toIndex),
      }));
    },
    [updateActiveProject]
  );

  const reorderCards = useCallback(
    (column: ColumnId, fromIndex: number, toIndex: number) => {
      updateActiveProject((project) => ({
        ...project,
        cards: reorderCardsInColumn(project.cards, column, fromIndex, toIndex),
      }));
    },
    [updateActiveProject]
  );

  // --- Archive ---

  const archiveCard = useCallback(
    (projectId: string, cardId: string) => {
      updateProjectById(projectId, (project) => {
        const card = project.cards.find((c) => c.id === cardId);
        if (!card) return project;
        return {
          ...project,
          cards: project.cards.filter((c) => c.id !== cardId),
          archivedCards: [
            ...project.archivedCards,
            { ...card, archivedAt: new Date().toISOString() },
          ],
        };
      });
    },
    [updateProjectById]
  );

  const archiveCompletedCards = useCallback(
    (projectId: string) => {
      updateProjectById(projectId, (project) => {
        const toArchive = project.cards.filter((c) => c.column === "complete");
        if (toArchive.length === 0) return project;
        const now = new Date().toISOString();
        return {
          ...project,
          cards: project.cards.filter((c) => c.column !== "complete"),
          archivedCards: [
            ...project.archivedCards,
            ...toArchive.map((c) => ({ ...c, archivedAt: now })),
          ],
        };
      });
    },
    [updateProjectById]
  );

  const restoreCard = useCallback(
    (projectId: string, cardId: string) => {
      updateProjectById(projectId, (project) => {
        const card = project.archivedCards.find((c) => c.id === cardId);
        if (!card) return project;
        const restored = { ...card, archivedAt: undefined };
        return {
          ...project,
          archivedCards: project.archivedCards.filter((c) => c.id !== cardId),
          cards: [
            ...project.cards,
            { ...restored, order: nextOrderInColumn(project.cards, restored.column) },
          ],
        };
      });
    },
    [updateProjectById]
  );

  /** Bulk restore — the undo half of archiveCompletedCards. */
  const restoreCards = useCallback(
    (projectId: string, cardIds: string[]) => {
      updateProjectById(projectId, (project) => {
        const idSet = new Set(cardIds);
        const toRestore = project.archivedCards
          .filter((c) => idSet.has(c.id))
          .map((c) => ({ ...c, archivedAt: undefined }));
        if (toRestore.length === 0) return project;
        return {
          ...project,
          archivedCards: project.archivedCards.filter((c) => !idSet.has(c.id)),
          cards: [...project.cards, ...toRestore],
        };
      });
    },
    [updateProjectById]
  );

  const deleteArchivedCard = useCallback(
    (projectId: string, cardId: string) => {
      updateProjectById(projectId, (project) => ({
        ...project,
        archivedCards: project.archivedCards.filter((c) => c.id !== cardId),
      }));
    },
    [updateProjectById]
  );

  /** Re-inserts a card back into the archive — the undo half of deleteArchivedCard. */
  const undoDeleteArchivedCard = useCallback(
    (projectId: string, card: KanbanCard) => {
      updateProjectById(projectId, (project) => ({
        ...project,
        archivedCards: [...project.archivedCards, card],
      }));
    },
    [updateProjectById]
  );

  // --- Todos ---

  const addTodo = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      updateActiveProject((project) => {
        const maxOrder = project.todos.reduce((max, t) => Math.max(max, t.order), -1);
        return {
          ...project,
          todos: [
            ...project.todos,
            {
              id: createId(),
              text: trimmed,
              done: false,
              order: maxOrder + 1,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });
    },
    [updateActiveProject]
  );

  const toggleTodo = useCallback(
    (id: string) => {
      updateActiveProject((project) => ({
        ...project,
        todos: project.todos.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        ),
      }));
    },
    [updateActiveProject]
  );

  const deleteTodo = useCallback(
    (id: string) => {
      updateActiveProject((project) => ({
        ...project,
        todos: project.todos.filter((todo) => todo.id !== id),
      }));
    },
    [updateActiveProject]
  );

  /** Re-inserts a todo exactly as it was — the undo half of deleteTodo. */
  const undoDeleteTodo = useCallback(
    (projectId: string, todo: TodoItem) => {
      updateProjectById(projectId, (project) => ({
        ...project,
        todos: [...project.todos, todo],
      }));
    },
    [updateProjectById]
  );

  const updateTodo = useCallback(
    (
      id: string,
      patch: { priority?: Priority | null; dueDate?: string | null; dueTime?: string | null }
    ) => {
      updateActiveProject((project) => ({
        ...project,
        todos: project.todos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                ...(patch.priority !== undefined
                  ? { priority: patch.priority ?? undefined }
                  : {}),
                ...(patch.dueDate !== undefined
                  ? {
                      dueDate: patch.dueDate ?? undefined,
                      dueTime: patch.dueDate ? (patch.dueTime ?? undefined) : undefined,
                    }
                  : {}),
              }
            : todo
        ),
      }));
    },
    [updateActiveProject]
  );

  const reorderTodos = useCallback(
    (fromIndex: number, toIndex: number) => {
      updateActiveProject((project) => {
        const sorted = [...project.todos].sort((a, b) => a.order - b.order);
        const [moved] = sorted.splice(fromIndex, 1);
        if (!moved) return project;
        sorted.splice(toIndex, 0, moved);
        return {
          ...project,
          todos: sorted.map((todo, index) => ({ ...todo, order: index })),
        };
      });
    },
    [updateActiveProject]
  );

  // --- Notes ---

  const updateNotes = useCallback(
    (text: string) => {
      updateActiveProject((project) => ({ ...project, notes: text }));
    },
    [updateActiveProject]
  );

  return {
    state,
    activeProject,
    replaceState,
    createProject,
    renameProject,
    deleteProject,
    undoDeleteProject,
    setActiveProject,
    addCard,
    updateCard,
    deleteCard,
    undoDeleteCard,
    moveCard,
    reorderCards,
    archiveCard,
    archiveCompletedCards,
    restoreCard,
    restoreCards,
    deleteArchivedCard,
    undoDeleteArchivedCard,
    addTodo,
    toggleTodo,
    deleteTodo,
    undoDeleteTodo,
    updateTodo,
    reorderTodos,
    updateNotes,
  };
}

export type UseAppState = ReturnType<typeof useAppState>;
