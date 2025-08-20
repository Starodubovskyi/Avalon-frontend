"use client";

import {
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  CheckSquare,
  Save,
  X,
  Play,
} from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import clsx from "clsx";
import React from "react";

type Task = {
  id: string;
  text: string;
  status: "todo" | "inprogress" | "done";
};

type Props = {
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
};

export default function KanbanCard({
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
}: Props) {
  const sortable =
    task.status !== "done"
      ? useSortable({ id: task.id })
      : {
          attributes: {},
          listeners: {},
          setNodeRef: undefined as any,
          transform: undefined as any,
          transition: undefined as any,
          isDragging: false,
        };

  const style: React.CSSProperties =
    sortable.setNodeRef && sortable.transform
      ? {
          transform: CSS.Transform.toString(sortable.transform),
          transition: sortable.transition,
          opacity: sortable.isDragging ? 0.7 : 1,
          cursor: "grab",
        }
      : {};

  // Light: «материальная» карточка с чёткой тенью (отлично читабельно)
  const lightBase =
    "bg-white border border-gray-200 text-gray-900 shadow-[0_10px_28px_rgba(2,6,23,0.08)] hover:shadow-[0_16px_40px_rgba(2,6,23,0.12)]";
  const lightDone = "bg-emerald-50 border-emerald-200 text-emerald-800";

  // Dark: как было
  const darkBase =
    "dark:bg-white/10 dark:border-white/10 dark:text-white dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)]";

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      {...(task.status !== "done" ? sortable.listeners : {})}
      className={clsx(
        "relative z-10 flex items-center group gap-2 rounded-xl px-4 py-3 mb-3 transition backdrop-blur-md",
        lightBase,
        task.status === "done" && lightDone,
        darkBase
      )}
    >
      <div className="flex flex-col items-center mr-2 gap-1">
        <button
          className={clsx(
            "p-1 rounded hover:bg-black/5 text-gray-600 transition",
            "dark:hover:bg-white/10 dark:text-gray-400",
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
            "p-1 rounded hover:bg-black/5 text-gray-600 transition",
            "dark:hover:bg-white/10 dark:text-gray-400",
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
            className="flex-1 px-2 py-1 rounded border
                       border-gray-300 bg-white text-gray-900
                       dark:border-white/20 dark:bg-white/10 dark:text-white"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit(task.id);
              if (e.key === "Escape") cancelEdit();
            }}
            autoFocus
          />
          <button
            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded dark:text-emerald-400 dark:hover:bg-emerald-900/30"
            onClick={() => saveEdit(task.id)}
            aria-label="Save"
            type="button"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            className="p-1 text-gray-600 hover:bg-black/5 rounded dark:text-gray-400 dark:hover:bg-white/10"
            onClick={cancelEdit}
            aria-label="Cancel"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </>
      ) : (
        <>
          <span
            className={clsx(
              "flex-1 select-text text-base transition-all cursor-pointer",
              task.status === "done" && "line-through opacity-80"
            )}
            onDoubleClick={() => onEdit(task)}
            title="Double click to edit"
          >
            {task.text}
          </span>

          {task.status === "todo" && onMoveToInProgress && (
            <button
              className="p-1 text-cyan-700 hover:bg-cyan-50 rounded-full transition
                         dark:text-cyan-200 dark:hover:bg-cyan-800/40"
              onClick={() => onMoveToInProgress(task.id)}
              aria-label="Move to In Progress"
              title="Move to In Progress"
              type="button"
            >
              <Play className="w-5 h-5" />
            </button>
          )}

          {task.status !== "done" && (
            <button
              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition
                         dark:text-emerald-400 dark:hover:bg-emerald-900/30"
              onClick={() => onComplete(task.id)}
              aria-label="Mark as done"
              title="Mark as done"
              type="button"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
          )}

          <button
            className="p-1 text-blue-700 hover:bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition
                       dark:text-blue-300 dark:hover:bg-blue-900/40"
            onClick={() => onEdit(task)}
            aria-label="Edit"
            type="button"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            className="p-1 text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition
                       dark:text-red-400 dark:hover:bg-red-900/40"
            onClick={() => onDelete(task.id)}
            aria-label="Delete"
            type="button"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
