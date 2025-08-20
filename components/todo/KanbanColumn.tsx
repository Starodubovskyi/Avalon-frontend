"use client";

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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import clsx from "clsx";
import KanbanCard from "./KanbanCard";
import TaskInput from "./TaskInput";

type Task = {
  id: string;
  text: string;
  status: "todo" | "inprogress" | "done";
};

type StatusMeta = {
  id: "todo" | "inprogress" | "done";
  label: string;
  color: string;
  dot: string;
  shadow: string;
};

type Props = {
  statusMeta: StatusMeta;
  tasks: Task[];
  editingId: string | null;
  editText: string;
  setEditText: (t: string) => void;
  saveEdit: (id: string) => void;
  cancelEdit: () => void;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  onMove: (dir: "up" | "down", t: Task) => void;
  onMoveToInProgress?: (id: string) => void;
  onDragStart: (statusId: "todo" | "inprogress" | "done") => void;
  onDragEnd: (e: DragEndEvent) => void;
  todoInputValue?: string;
  onTodoInputChange?: (v: string) => void;
  onTodoSubmit?: () => void;
  todoInputRef?: React.RefObject<HTMLInputElement>;
};

export default function KanbanColumn({
  statusMeta,
  tasks,
  editingId,
  editText,
  setEditText,
  saveEdit,
  cancelEdit,
  onEdit,
  onDelete,
  onComplete,
  onMove,
  onMoveToInProgress,
  onDragStart,
  onDragEnd,
  todoInputValue,
  onTodoInputChange,
  onTodoSubmit,
  todoInputRef,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={() => onDragStart(statusMeta.id)}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        id={statusMeta.id}
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className={clsx(
            "isolate flex-1 min-w-[260px] rounded-3xl flex flex-col px-5 py-5 border-2",
            statusMeta.color,
            statusMeta.shadow,
            "backdrop-blur-md border-white/20"
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className={clsx("w-3 h-3 rounded-full", statusMeta.dot)} />
            <h2 className="font-bold text-lg text-white/80 tracking-wide">
              {statusMeta.label}
            </h2>
            <span
              className={clsx(
                "ml-auto text-xs font-bold",
                statusMeta.id === "todo" && "text-purple-200",
                statusMeta.id === "inprogress" && "text-cyan-200",
                statusMeta.id === "done" && "text-emerald-100"
              )}
            >
              {tasks.length}
            </span>
          </div>

          {statusMeta.id === "todo" && (
            <TaskInput
              value={todoInputValue || ""}
              onChange={(v) => onTodoInputChange && onTodoInputChange(v)}
              onSubmit={() => onTodoSubmit && onTodoSubmit()}
              inputRef={todoInputRef}
            />
          )}

          <div className="flex flex-col flex-1 min-h-[40px]">
            {tasks.length === 0 && (
              <div className="text-xs text-white/50 text-center py-6">
                {statusMeta.id === "todo" && "No tasks yet"}
                {statusMeta.id === "inprogress" && "Nothing in progress"}
                {statusMeta.id === "done" && "No tasks done"}
              </div>
            )}

            {tasks.map((task, idx) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={idx}
                total={tasks.length}
                onEdit={onEdit}
                onDelete={onDelete}
                onComplete={onComplete}
                editingId={editingId}
                editText={editText}
                setEditText={setEditText}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                onMove={onMove}
                onMoveToInProgress={
                  statusMeta.id === "todo" ? onMoveToInProgress : undefined
                }
              />
            ))}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
}
