"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAppStateContext } from "@/context/AppStateContext";
import { useToast } from "@/context/ToastContext";
import { TodoListItem } from "@/components/todos/TodoListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { parseQuickAdd } from "@/lib/quickAdd";

export function TodoList() {
  const {
    activeProject,
    addTodo,
    toggleTodo,
    deleteTodo,
    undoDeleteTodo,
    updateTodo,
    reorderTodos,
  } = useAppStateContext();
  const { showToast } = useToast();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!activeProject) return null;

  const todos = [...activeProject.todos].sort((a, b) => a.order - b.order);
  const todoIds = todos.map((t) => t.id);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    const parsed = parseQuickAdd(draft);
    if (!parsed.title) {
      setError("needs some plain text as the title, not just #tags/!priority/@date");
      return;
    }
    setError(null);
    addTodo(parsed.title, {
      priority: parsed.priority ?? undefined,
      dueDate: parsed.dueDate ?? undefined,
      tags: parsed.tags,
    });
    setDraft("");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = todos.findIndex((t) => t.id === active.id);
    const toIndex = todos.findIndex((t) => t.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderTodos(fromIndex, toIndex);
    }
  }

  return (
    <div className="flex flex-col min-h-0">
      <h2 className="font-mono text-xs text-text-faint px-3 pt-3 pb-2">{"// todo"}</h2>
      <div className="flex-1 overflow-y-auto px-2">
        {todos.length === 0 ? (
          <EmptyState>$ no todos yet</EmptyState>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
              {todos.map((todo) => (
                <TodoListItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => {
                    deleteTodo(todo.id);
                    showToast(`"${todo.text}" deleted`, () =>
                      undoDeleteTodo(activeProject.id, todo)
                    );
                  }}
                  onChangePriority={(priority) => updateTodo(todo.id, { priority })}
                  onChangeDueDate={(dueDate, dueTime, recurrence) =>
                    updateTodo(todo.id, { dueDate, dueTime, recurrence })
                  }
                  onChangeTags={(tags) => updateTodo(todo.id, { tags })}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
      <form onSubmit={handleSubmit} className="px-3 py-2 border-t border-border">
        <Input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Add a todo... #tag !p1 @tomorrow"
        />
        {error && <p className="mt-1 font-mono text-[11px] text-alert">{error}</p>}
      </form>
    </div>
  );
}
