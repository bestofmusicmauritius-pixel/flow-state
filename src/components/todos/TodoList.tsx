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
import { TodoListItem } from "@/components/todos/TodoListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";

export function TodoList() {
  const { activeProject, addTodo, toggleTodo, deleteTodo, updateTodo, reorderTodos } =
    useAppStateContext();
  const [draft, setDraft] = useState("");

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
    addTodo(draft);
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
                  onDelete={() => deleteTodo(todo.id)}
                  onChangePriority={(priority) => updateTodo(todo.id, { priority })}
                  onChangeDueDate={(dueDate, dueTime) => updateTodo(todo.id, { dueDate, dueTime })}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
      <form onSubmit={handleSubmit} className="px-3 py-2 border-t border-border">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a todo..."
        />
      </form>
    </div>
  );
}
