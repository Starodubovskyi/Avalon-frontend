"use client";

import React, { useEffect, useRef, useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { CheckSquare } from "lucide-react";
import { STATUSES } from "./constants";
import KanbanColumn from "./KanbanColumn";

type StatusId = "todo" | "inprogress" | "done";

type Task = {
  id: string;
  text: string;
  status: StatusId;
};

function reorder(array: Task[], from: number, to: number) {
  const a = [...array];
  const [item] = a.splice(from, 1);
  a.splice(to, 0, item);
  return a;
}

export default function TodoBoard() {
  const [tasks, setTasks] = useState<Record<StatusId, Task[]>>({
    todo: [],
    inprogress: [],
    done: [],
  });

  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeCol, setActiveCol] = useState<StatusId | null>(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? localStorage.getItem("kanban-tasks-v3")
        : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.todo && parsed.inprogress && parsed.done) {
          setTasks(parsed);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kanban-tasks-v3", JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = () => {
    if (input.trim().length === 0) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: input,
      status: "todo",
    };
    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, newTask],
    }));
    setInput("");
    inputRef.current?.focus();
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = (id: string) => {
    setTasks(
      (prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([col, arr]) => [
            col,
            (arr as Task[]).map((t) =>
              t.id === id ? { ...t, text: editText } : t
            ),
          ])
        ) as Record<StatusId, Task[]>
    );
    setEditingId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const deleteTask = (id: string) => {
    setTasks(
      (prev) =>
        Object.fromEntries(
          Object.entries(prev).map(([col, arr]) => [
            col,
            (arr as Task[]).filter((t) => t.id !== id),
          ])
        ) as Record<StatusId, Task[]>
    );
  };

  const completeTask = (id: string) => {
    setTasks((prev) => {
      let completedTask: Task | undefined;
      const nextState = Object.fromEntries(
        Object.entries(prev).map(([col, arr]) => [
          col,
          (arr as Task[]).filter((t) => {
            if (t.id === id) completedTask = t;
            return t.id !== id;
          }),
        ])
      ) as Record<StatusId, Task[]>;
      if (completedTask) {
        completedTask = { ...completedTask, status: "done" };
        nextState.done = [...nextState.done, completedTask];
      }
      return nextState;
    });
  };

  const moveTask = (direction: "up" | "down", task: Task) => {
    setTasks((prev) => {
      const colArr = prev[task.status];
      const idx = colArr.findIndex((t) => t.id === task.id);
      if (
        (direction === "up" && idx === 0) ||
        (direction === "down" && idx === colArr.length - 1)
      )
        return prev;
      const newArr = reorder(
        colArr,
        idx,
        direction === "up" ? idx - 1 : idx + 1
      );
      return { ...prev, [task.status]: newArr };
    });
  };

  const moveToInProgress = (id: string) => {
    setTasks((prev) => {
      const task = prev.todo.find((t) => t.id === id);
      if (!task) return prev;
      return {
        ...prev,
        todo: prev.todo.filter((t) => t.id !== id),
        inprogress: [...prev.inprogress, { ...task, status: "inprogress" }],
      };
    });
  };

  const onDragStart = (statusId: StatusId) => setActiveCol(statusId);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !activeCol) return;
    const colTasks = tasks[activeCol];
    const oldIndex = colTasks.findIndex((t) => t.id === active.id);
    const newIndex = colTasks.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setTasks((prev) => ({
      ...prev,
      [activeCol]: arrayMove(colTasks, oldIndex, newIndex),
    }));
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-2 py-10">
      <div
        className="
          w-full max-w-7xl
          rounded-3xl border
          border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)]
          dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]
          px-6 py-10
        "
      >
        <h1 className="text-3xl font-extrabold text-black dark:text-white flex items-center gap-3 mb-10 drop-shadow-sm">
          <CheckSquare className="w-9 h-9 text-purple-500 dark:text-purple-300" />
          My To Do Board
        </h1>

        <div className="w-full flex flex-col md:flex-row gap-8 items-stretch">
          {STATUSES.map((meta) => (
            <KanbanColumn
              key={meta.id}
              statusMeta={meta as any}
              tasks={tasks[meta.id as StatusId]}
              editingId={editingId}
              editText={editText}
              setEditText={setEditText}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
              onEdit={startEdit}
              onDelete={deleteTask}
              onComplete={completeTask}
              onMove={moveTask}
              onMoveToInProgress={
                meta.id === "todo" ? moveToInProgress : undefined
              }
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              todoInputValue={meta.id === "todo" ? input : undefined}
              onTodoInputChange={meta.id === "todo" ? setInput : undefined}
              onTodoSubmit={meta.id === "todo" ? addTask : undefined}
              todoInputRef={meta.id === "todo" ? inputRef : undefined}
            />
          ))}
        </div>

        <div className="mt-8 text-xs text-gray-600 dark:text-white/40">
          You can control your tasks
        </div>
      </div>
    </div>
  );
}
