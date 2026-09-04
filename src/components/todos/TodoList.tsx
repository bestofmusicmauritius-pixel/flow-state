"use client";

import { useState } from "react";
import { useAppStateContext } from "@/context/AppStateContext";
import { TodoListItem } from "@/components/todos/TodoListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";

export function TodoList() {
  const { activeProject, addTodo, toggleTodo, deleteTodo } = useAppStateContext();
  const [draft, setDraft] = useState("");

  if (!activeProject) return null;

  const todos = [...activeProject.todos].sort((a, b) => a.order - b.order);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    addTodo(draft);
    setDraft("");
  }

  return (
    <div className="flex flex-col min-h-0">
      <h2 className="font-mono text-xs text-text-faint px-3 pt-3 pb-2">{"// todo"}</h2>
      <div className="flex-1 overflow-y-auto px-2">
        {todos.length === 0 ? (
          <EmptyState>$ no todos yet</EmptyState>
        ) : (
          todos.map((todo) => (
            <TodoListItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
            />
          ))
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
