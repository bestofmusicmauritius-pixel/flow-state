"use client";

import { useCallback, useEffect, useState } from "react";
import { createId } from "@/lib/id";
import { moveCardToColumn, nextOrderInColumn, reorderCardsInColumn } from "@/lib/reorder";
import { createEmptyProject, seedState } from "@/lib/seed";
import { localStorageStore } from "@/lib/storage";
import type { AppState, ColumnId, Project } from "@/types";

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

  // --- Kanban cards ---

  const addCard = useCallback(
    (column: ColumnId, title: string, description?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      updateActiveProject((project) => {
        const now = new Date().toISOString();
        const card = {
          id: createId(),
          title: trimmed,
          description: description?.trim() || undefined,
          column,
          order: nextOrderInColumn(project.cards, column),
          createdAt: now,
          updatedAt: now,
        };
        return { ...project, cards: [...project.cards, card] };
      });
    },
    [updateActiveProject]
  );

  const updateCard = useCallback(
    (cardId: string, patch: { title?: string; description?: string }) => {
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
    createProject,
    renameProject,
    deleteProject,
    setActiveProject,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    reorderCards,
    addTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    updateNotes,
  };
}

export type UseAppState = ReturnType<typeof useAppState>;
