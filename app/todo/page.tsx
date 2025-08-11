"use client"
import React, { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  Save,
  X,
  Play,
} from "lucide-react";
import clsx from "clsx";
import MainLayout from "@/components/layout/MainLayout";

const STATUSES = [
  {
    id: "todo",
    label: "To Do",
    color: "bg-gradient-to-b from-purple-800/40 to-purple-900/60 border-purple-500/30",
    dot: "bg-purple-400/80",
    shadow: "shadow-[0_8px_32px_0_rgba(64,0,128,0.13)]",
  },
  {
    id: "inprogress",
    label: "In Progress",
    color: "bg-gradient-to-b from-cyan-800/40 to-cyan-900/60 border-cyan-500/30",
    dot: "bg-cyan-300/80",
    shadow: "shadow-[0_8px_32px_0_rgba(0,220,240,0.13)]",
  },
  {
    id: "done",
    label: "Done",
    color: "bg-gradient-to-b from-emerald-800/40 to-emerald-900/60 border-emerald-500/30",
    dot: "bg-emerald-400/80",
    shadow: "shadow-[0_8px_32px_0_rgba(0,128,64,0.12)]",
  },
];

type Task = {
  id: string;
  text: string;
  status: string;
};

function KanbanCard({
  task,
  index,
  total,
  onEdit,
  onDelete,
  onComplete,
  onMove,
  editingId,
  editText,
  setEditText,
  saveEdit,
  cancelEdit,
  onMoveToInProgress,
}: {
  task: Task;
  index: number;
  total: number;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onMove: (dir: "up" | "down", t: Task) => void;
  editingId: string | null;
  editText: string;
  setEditText: (t: string) => void;
  saveEdit: (id: string) => void;
  cancelEdit: () => void;
  onMoveToInProgress?: (id: string) => void;
}) {
  const sortable =
    task.status !== "done"
      ? useSortable({ id: task.id })
      : { attributes: {}, listeners: {}, setNodeRef: undefined, transform: undefined, transition: undefined, isDragging: false };

  const style: React.CSSProperties =
    sortable.setNodeRef && sortable.transform
      ? {
          transform: CSS.Transform.toString(sortable.transform),
          transition: sortable.transition,
          opacity: sortable.isDragging ? 0.7 : 1,
          cursor: "grab",
        }
      : {};

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      {...sortable.listeners}
      className={clsx(
        "flex items-center group gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 mb-3 backdrop-blur-md shadow-sm hover:shadow-lg transition",
        task.status === "done" && "border-emerald-500/40 bg-emerald-300/10 text-emerald-100/90"
      )}
    >
      <div className="flex flex-col items-center mr-2 gap-1">
        <button
          className={clsx(
            "p-1 rounded hover:bg-white/10 text-gray-400 transition",
            index === 0 && "opacity-30 pointer-events-none"
          )}
          onClick={() => onMove("up", task)}
          disabled={index === 0}
          tabIndex={-1}
          title="Move up"
          type="button"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          className={clsx(
            "p-1 rounded hover:bg-white/10 text-gray-400 transition",
            index === total - 1 && "opacity-30 pointer-events-none"
          )}
          onClick={() => onMove("down", task)}
          disabled={index === total - 1}
          tabIndex={-1}
          title="Move down"
          type="button"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>
      {editingId === task.id ? (
        <>
          <input
            className="flex-1 px-2 py-1 rounded border border-white/20 bg-white/10 text-white"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit(task.id);
              if (e.key === "Escape") cancelEdit();
            }}
            autoFocus
          />
          <button
            className="p-1 text-emerald-400 hover:bg-emerald-900/30 rounded"
            onClick={() => saveEdit(task.id)}
            aria-label="Save"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            className="p-1 text-gray-400 hover:bg-white/10 rounded"
            onClick={cancelEdit}
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          <span
            className={clsx(
              "flex-1 select-text text-base transition-all cursor-pointer",
              task.status === "done" && "line-through text-emerald-200/80"
            )}
            onDoubleClick={() => onEdit(task)}
            title="Double click to edit"
          >
            {task.text}
          </span>
          {task.status === "todo" && onMoveToInProgress && (
            <button
              className="p-1 text-cyan-200 hover:bg-cyan-800/40 rounded-full opacity-100 transition"
              onClick={() => onMoveToInProgress(task.id)}
              aria-label="Move to In Progress"
              title="Move to In Progress"
            >
              <Play className="w-5 h-5" />
            </button>
          )}
          {task.status !== "done" && (
            <button
              className="p-1 text-emerald-400 hover:bg-emerald-900/30 rounded-full opacity-0 group-hover:opacity-100 transition"
              onClick={() => onComplete(task.id)}
              aria-label="Mark as done"
              title="Mark as done"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
          )}
          <button
            className="p-1 text-blue-300 hover:bg-blue-900/40 rounded-full opacity-0 group-hover:opacity-100 transition"
            onClick={() => onEdit(task)}
            aria-label="Edit"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            className="p-1 text-red-400 hover:bg-red-900/40 rounded-full opacity-0 group-hover:opacity-100 transition"
            onClick={() => onDelete(task.id)}
            aria-label="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}

function reorder(array: Task[], from: number, to: number) {
  const a = [...array];
  const [item] = a.splice(from, 1);
  a.splice(to, 0, item);
  return a;
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    todo: [],
    inprogress: [],
    done: [],
  });
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeCol, setActiveCol] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("kanban-tasks-v3");
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("kanban-tasks-v3", JSON.stringify(tasks));
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
    setTasks((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([col, arr]) => [
          col,
          arr.map((t) => (t.id === id ? { ...t, text: editText } : t)),
        ])
      ) as Record<string, Task[]>
    );
    setEditingId(null);
    setEditText("");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const deleteTask = (id: string) => {
    setTasks((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([col, arr]) => [
          col,
          arr.filter((t) => t.id !== id),
        ])
      ) as Record<string, Task[]>
    );
  };

  const completeTask = (id: string) => {
    setTasks((prev) => {
      let completedTask: Task | undefined;
      const nextState = Object.fromEntries(
        Object.entries(prev).map(([col, arr]) => [
          col,
          arr.filter((t) => {
            if (t.id === id) completedTask = t;
            return t.id !== id;
          }),
        ])
      ) as Record<string, Task[]>;
      if (completedTask) {
        completedTask.status = "done";
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
      const newArr = reorder(colArr, idx, direction === "up" ? idx - 1 : idx + 1);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

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
    <MainLayout>

    <div
      className="min-h-screen w-full flex flex-col items-center px-2 py-10"
      style={{
        background:
        "linear-gradient(120deg,rgba(20,18,34,0.78) 0%,rgba(26,22,44,0.72) 70%,rgba(24,24,30,0.64) 100%)",
        backdropFilter: "blur(12px)",
      }}
      >
      <h1 className="text-3xl font-extrabold text-white/90 flex items-center gap-3 mb-10 drop-shadow-sm">
        <CheckSquare className="w-9 h-9 text-purple-300/90" />
        My To Do Board
      </h1>
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8 items-stretch">
        {STATUSES.map((col) => (
          <DndContext
          key={col.id}
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={() => setActiveCol(col.id)}
            onDragEnd={onDragEnd}
            >
            <SortableContext
              id={col.id}
              items={tasks[col.id].map((t) => t.id)}
              strategy={verticalListSortingStrategy}
              >
              <div
                className={clsx(
                  "flex-1 min-w-[260px] rounded-3xl border-2 flex flex-col px-5 py-5",
                  col.color,
                  col.shadow,
                  "backdrop-blur-md border-white/20"
                )}
                >
                <div className="flex items-center gap-2 mb-4">
                  <span className={clsx("w-3 h-3 rounded-full", col.dot)} />
                  <h2 className="font-bold text-lg text-white/80 tracking-wide">{col.label}</h2>
                  <span
                    className={clsx(
                      "ml-auto text-xs font-bold",
                      col.id === "todo" && "text-purple-200",
                      col.id === "inprogress" && "text-cyan-200",
                      col.id === "done" && "text-emerald-100"
                    )}
                  >
                    {tasks[col.id].length}
                  </span>
                </div>
                {col.id === "todo" && (
                  <div className="flex gap-2 mb-5">
                    <input
                      ref={inputRef}
                      className="flex-1 px-3 py-2 rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none text-base shadow-inner placeholder-gray-400/70"
                      type="text"
                      placeholder="Add task..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask();
                      }}
                      />
                    <button
                      className="bg-purple-700/70 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow transition active:scale-95 flex items-center"
                      onClick={addTask}
                      aria-label="Add task"
                      >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="flex flex-col flex-1 min-h-[40px]">
                  {tasks[col.id].length === 0 && (
                    <div className="text-xs text-white/40 text-center py-6">
                      {col.id === "todo" && "No tasks yet"}
                      {col.id === "inprogress" && "Nothing in progress"}
                      {col.id === "done" && "No tasks done"}
                    </div>
                  )}
                  {tasks[col.id].map((task, idx) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      index={idx}
                      total={tasks[col.id].length}
                      onEdit={startEdit}
                      onDelete={deleteTask}
                      onComplete={completeTask}
                      editingId={editingId}
                      editText={editText}
                      setEditText={setEditText}
                      saveEdit={saveEdit}
                      cancelEdit={cancelEdit}
                      onMove={moveTask}
                      onMoveToInProgress={col.id === "todo" ? moveToInProgress : undefined}
                      />
                    ))}
                </div>
              </div>
            </SortableContext>
          </DndContext>
        ))}
      </div>
      <div className="mt-8 text-xs text-white/40">
        You can control your tasks
      </div>
    </div>
        </MainLayout>
  );
}
