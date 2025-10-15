"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useProjectStore,
  type Status,
  type Task,
  type User,
} from "../store/tasks";
import { MoreHorizontal } from "lucide-react";
import Avatar from "../shared/Avatar";
import TaskDetailsModal from "../TaskDetailsModal";

type Filters = {
  due: "any" | "today" | "week" | "overdue";
  assignee: "all" | "unassigned" | string;
  priority: "all" | "low" | "normal" | "high";
};

const STATUS_META: Record<
  Status,
  { title: string; chipClass: string; colBg: string }
> = {
  todo: {
    title: "Pending",
    chipClass: "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-200",
    colBg: "bg-white dark:bg-white/[0.04]",
  },
  inprogress: {
    title: "In Progress",
    chipClass:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300",
    colBg: "bg-white dark:bg-white/[0.04]",
  },
  done: {
    title: "Completed",
    chipClass:
      "bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-300",
    colBg: "bg-white dark:bg-white/[0.04]",
  },
};

export default function Board({ filters }: { filters: Filters }) {
  const tasks = useProjectStore((s) => s.tasks);
  const users = useProjectStore((s) => s.users);
  const moveTask = useProjectStore((s) => s.moveTask);

  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const list = Object.values(tasks);
    const inRange = (iso?: string | null) => {
      if (filters.due === "any") return true;
      if (!iso) return false;
      const d = new Date(iso);
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endToday = new Date(start);
      endToday.setDate(start.getDate() + 1);
      if (filters.due === "today") return d >= start && d < endToday;
      if (filters.due === "week") {
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return d >= start && d < end;
      }
      if (filters.due === "overdue") return d < start;
      return true;
    };
    return list.filter((t) => {
      if (!inRange(t.dueAt)) return false;
      if (filters.assignee === "unassigned" && t.assigneeId) return false;
      if (
        filters.assignee !== "all" &&
        filters.assignee !== "unassigned" &&
        t.assigneeId !== filters.assignee
      )
        return false;
      if (filters.priority !== "all" && t.priority !== filters.priority)
        return false;
      return true;
    });
  }, [tasks, filters]);

  const initialIds = useMemo(
    () => ({
      todo: visible
        .filter((t) => t.status === "todo")
        .sort((a, b) => a.order - b.order)
        .map((t) => t.id),
      inprogress: visible
        .filter((t) => t.status === "inprogress")
        .sort((a, b) => a.order - b.order)
        .map((t) => t.id),
      done: visible
        .filter((t) => t.status === "done")
        .sort((a, b) => a.order - b.order)
        .map((t) => t.id),
    }),
    [visible]
  );

  const [idsByStatus, setIdsByStatus] = useState(initialIds);
  useEffect(() => setIdsByStatus(initialIds), [initialIds]);

  const safe = {
    todo: useMemo(
      () => idsByStatus.todo.filter((id) => Boolean(tasks[id])),
      [idsByStatus.todo, tasks]
    ),
    inprogress: useMemo(
      () => idsByStatus.inprogress.filter((id) => Boolean(tasks[id])),
      [idsByStatus.inprogress, tasks]
    ),
    done: useMemo(
      () => idsByStatus.done.filter((id) => Boolean(tasks[id])),
      [idsByStatus.done, tasks]
    ),
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const findContainer = (id: string | null) => {
    if (!id) return null;
    if (id === "todo" || id === "inprogress" || id === "done")
      return id as Status;
    if (safe.todo.includes(id)) return "todo" as Status;
    if (safe.inprogress.includes(id)) return "inprogress" as Status;
    if (safe.done.includes(id)) return "done" as Status;
    return null;
  };

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragOver(e: DragOverEvent) {
    const active = String(e.active.id);
    const over = e.over ? String(e.over.id) : null;
    const from = findContainer(active);
    const to = findContainer(over);
    if (!from || !to) return;

    setIdsByStatus((prev) => {
      const next = { ...prev };

      if (from === to) {
        const list = Array.from(next[from]);
        const oldIndex = list.indexOf(active);
        if (oldIndex === -1) return prev;
        const newIndex =
          over && list.includes(over) ? list.indexOf(over) : list.length - 1;
        list.splice(oldIndex, 1);
        list.splice(newIndex, 0, active);
        next[from] = list;
        return next;
      }

      const fromItems = Array.from(next[from]);
      const toItems = Array.from(next[to]);
      const activeIndex = fromItems.indexOf(active);
      if (activeIndex === -1) return prev;

      fromItems.splice(activeIndex, 1);
      const overIndex =
        over && toItems.includes(over) ? toItems.indexOf(over) : toItems.length;
      const idxDup = toItems.indexOf(active);
      if (idxDup !== -1) toItems.splice(idxDup, 1);
      toItems.splice(overIndex, 0, active);

      next[from] = fromItems;
      next[to] = toItems;
      return next;
    });
  }

  function onDragEnd(e: DragEndEvent) {
    const active = String(e.active.id);
    const over = e.over ? String(e.over.id) : null;
    const to = findContainer(over);
    if (!to) return;
    const index =
      idsByStatus[to].indexOf(active) !== -1
        ? idsByStatus[to].indexOf(active)
        : safe[to].indexOf(active);
    if (index === -1) return;
    moveTask(active, to, index);
    setActiveId(null);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(["todo", "inprogress", "done"] as Status[]).map((key) => (
            <Column
              key={key}
              status={key}
              title={STATUS_META[key].title}
              chipClass={STATUS_META[key].chipClass}
              bgClass={STATUS_META[key].colBg}
              ids={safe[key]}
              renderCard={(id) => {
                const t = tasks[id];
                if (!t) return null;
                const assignee: User | undefined = t.assigneeId
                  ? users[t.assigneeId]
                  : undefined;
                return (
                  <TaskCardSortable
                    key={t.id}
                    id={t.id}
                    task={t}
                    assignee={assignee}
                    onOpen={() => setOpenTaskId(t.id)}
                  />
                );
              }}
            />
          ))}
        </div>
      </DndContext>

      <TaskDetailsModal
        taskId={openTaskId}
        open={!!openTaskId}
        onClose={() => setOpenTaskId(null)}
      />
    </>
  );
}

function Column({
  status,
  title,
  chipClass,
  bgClass,
  ids,
  renderCard,
}: {
  status: Status;
  title: string;
  chipClass: string;
  bgClass: string;
  ids: string[];
  renderCard: (id: string) => React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section
      className={`rounded-2xl border border-gray-200 ${bgClass} p-3 dark:border-white/10`}
    >
      <header className="mb-3 flex items-center justify-between">
        <span className={`rounded-md px-2 py-1 text-xs ${chipClass}`}>
          {title}
        </span>
        <button
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
          title="More"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      <div
        ref={setNodeRef}
        className={`min-h-[16px] space-y-3 rounded-xl ${
          isOver ? "bg-violet-50/70 dark:bg-violet-400/10" : ""
        } p-0.5`}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {ids.map((id) => renderCard(id))}
        </SortableContext>
      </div>
    </section>
  );
}

function TaskCardSortable({
  id,
  task,
  assignee,
  onOpen,
}: {
  id: string;
  task: Task;
  assignee?: User;
  onOpen: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueLabel = task.dueAt
    ? new Date(task.dueAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

  const overdue =
    task.dueAt &&
    new Date(task.dueAt) < new Date(new Date().setHours(0, 0, 0, 0));

  const dot =
    task.priority === "high"
      ? "bg-red-500"
      : task.priority === "low"
      ? "bg-blue-500"
      : "bg-gray-400";

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03] ${
        isDragging ? "ring-2 ring-violet-500/50" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={onOpen}
          onKeyDown={(e) => (e.key === "Enter" ? onOpen() : null)}
          className="text-left font-medium text-gray-900 underline-offset-2 hover:underline dark:text-gray-100"
        >
          {task.title}
        </button>
        <button
          aria-label="Drag"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded px-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:text-gray-500 dark:hover:text-gray-300"
          title="Drag"
        >
          ⋮⋮
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-300">
          <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1 dark:border-white/10">
            <span className="text-[11px] uppercase tracking-wide">Due</span>
            <span className={`${overdue ? "text-red-500" : ""}`}>
              {dueLabel}
            </span>
            {overdue && (
              <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-[11px] text-red-600 dark:text-red-400">
                Overdue
              </span>
            )}
          </span>

          <span className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1 dark:border-white/10">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            <span className="text-[11px]">
              {task.priority === "high"
                ? "High Priority"
                : task.priority === "low"
                ? "Low Priority"
                : "Normal Priority"}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {assignee ? (
            <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 dark:border-white/10 dark:text-gray-200">
              <Avatar name={assignee.name} src={assignee.avatarUrl} size={18} />
              <span>{assignee.name}</span>
            </div>
          ) : (
            <div className="text-xs text-gray-400">Unassigned</div>
          )}
        </div>
      </div>
    </article>
  );
}
