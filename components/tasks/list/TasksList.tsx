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
import { useProjectStore, type Status } from "../store/tasks";
import AssigneeDropdown from "@/components/tasks/shared/AssigneeDropdown";
import DateInline from "@/components/tasks/shared/DateInline";
import PrioritySelect from "@/components/tasks/shared/PrioritySelect";
import TaskDetailsModal from "../TaskDetailsModal";
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";

type Filters = {
  due: "any" | "today" | "week" | "overdue";
  assignee: "all" | "unassigned" | string;
  priority: "all" | "low" | "normal" | "high";
};

export default function TasksList({ filters }: { filters: Filters }) {
  const tasks = useProjectStore((s) => s.tasks);
  const assign = useProjectStore((s) => s.assignTask);
  const setDue = useProjectStore((s) => s.setDueDate);
  const setPriority = useProjectStore((s) => s.setPriority);
  const remove = useProjectStore((s) => s.deleteTask);
  const moveTask = useProjectStore((s) => s.moveTask);

  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const [collapsed, setCollapsed] = useState<Record<Status, boolean>>({
    todo: false,
    inprogress: false,
    done: false,
  });
  const toggle = (s: Status) => setCollapsed((p) => ({ ...p, [s]: !p[s] }));

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
    const from = findContainer(active);
    const to = findContainer(over);
    setActiveId(null);
    if (!from || !to) return;

    const index =
      idsByStatus[to].indexOf(active) !== -1
        ? idsByStatus[to].indexOf(active)
        : safe[to].indexOf(active);

    if (index === -1) return;
    moveTask(active, to, index);
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
        <div className="space-y-5">
          <Group
            title="Pending"
            color="bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-200"
            status="todo"
            collapsed={collapsed.todo}
            onToggle={() => toggle("todo")}
            ids={safe.todo}
            renderRow={(id) => {
              const t = tasks[id];
              if (!t) return null;
              return (
                <RowSortable
                  id={t.id}
                  title={t.title}
                  assigneeId={t.assigneeId || null}
                  dueAt={t.dueAt || null}
                  priority={t.priority}
                  onAssignee={(uid) => assign(t.id, uid)}
                  onDue={(d) => setDue(t.id, d)}
                  onPriority={(p) => setPriority(t.id, p)}
                  onDelete={() => remove(t.id)}
                  onOpen={() => setOpenTaskId(t.id)}
                />
              );
            }}
          />

          <Group
            title="In Progress"
            color="bg-yellow-100 text-yellow-800 dark:bg-yellow-400/15 dark:text-yellow-300"
            status="inprogress"
            collapsed={collapsed.inprogress}
            onToggle={() => toggle("inprogress")}
            ids={safe.inprogress}
            renderRow={(id) => {
              const t = tasks[id];
              if (!t) return null;
              return (
                <RowSortable
                  id={t.id}
                  title={t.title}
                  assigneeId={t.assigneeId || null}
                  dueAt={t.dueAt || null}
                  priority={t.priority}
                  onAssignee={(uid) => assign(t.id, uid)}
                  onDue={(d) => setDue(t.id, d)}
                  onPriority={(p) => setPriority(t.id, p)}
                  onDelete={() => remove(t.id)}
                  onOpen={() => setOpenTaskId(t.id)}
                />
              );
            }}
          />

          <Group
            title="Completed"
            color="bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-300"
            status="done"
            collapsed={collapsed.done}
            onToggle={() => toggle("done")}
            ids={safe.done}
            renderRow={(id) => {
              const t = tasks[id];
              if (!t) return null;
              return (
                <RowSortable
                  id={t.id}
                  title={t.title}
                  assigneeId={t.assigneeId || null}
                  dueAt={t.dueAt || null}
                  priority={t.priority}
                  onAssignee={(uid) => assign(t.id, uid)}
                  onDue={(d) => setDue(t.id, d)}
                  onPriority={(p) => setPriority(t.id, p)}
                  onDelete={() => remove(t.id)}
                  onOpen={() => setOpenTaskId(t.id)}
                />
              );
            }}
          />
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

function Group({
  title,
  color,
  status,
  collapsed,
  onToggle,
  ids,
  renderRow,
}: {
  title: string;
  color: string;
  status: Status;
  collapsed: boolean;
  onToggle: () => void;
  ids: string[];
  renderRow: (id: string) => React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section className="rounded-2xl border border-gray-200 bg-white dark:bg-white/[0.04] dark:border-white/10">
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <span
            className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs ${color}`}
          >
            {title}
          </span>
        </div>
        <button
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
          title="More"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      {!collapsed && (
        <>
          <div className="grid grid-cols-[24px_1fr_200px_220px_200px_40px] items-center gap-3 border-y border-gray-100 px-3 py-2 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
            <div />
            <div>Name</div>
            <div>Assignee</div>
            <div>Due Date</div>
            <div>Priority</div>
            <div />
          </div>

          <div
            ref={setNodeRef}
            className={`min-h-[44px] ${
              isOver ? "bg-violet-50/70 dark:bg-violet-400/10" : ""
            }`}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-gray-100 dark:divide-white/10">
                {ids.map((id) => renderRow(id))}
              </div>
            </SortableContext>
          </div>
        </>
      )}
    </section>
  );
}

function RowSortable({
  id,
  title,
  assigneeId,
  dueAt,
  priority,
  onAssignee,
  onDue,
  onPriority,
  onDelete,
  onOpen,
}: {
  id: string;
  title: string;
  assigneeId: string | null;
  dueAt: string | null;
  priority: "low" | "normal" | "high";
  onAssignee: (id: string | null) => void;
  onDue: (iso?: string | null) => void;
  onPriority: (p: "low" | "normal" | "high") => void;
  onDelete: () => void;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[24px_1fr_200px_220px_200px_40px] items-center gap-3 px-3 py-2 ${
        isDragging ? "rounded-xl bg-gray-50 shadow dark:bg-white/10" : ""
      }`}
    >
      <div>
        <button
          aria-label="Drag handle"
          {...attributes}
          {...listeners}
          className="h-4 w-4 cursor-grab rounded border border-transparent text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:text-gray-500 dark:hover:text-gray-300"
          title="Drag"
        >
          ⋮⋮
        </button>
      </div>

      <button
        className="truncate text-left text-sm text-gray-900 underline-offset-2 hover:underline dark:text-gray-100"
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" ? onOpen() : null)}
        title="Open task details"
      >
        {title}
      </button>

      <div>
        <AssigneeDropdown value={assigneeId} onChange={onAssignee} />
      </div>

      <div>
        <DateInline value={dueAt} onChange={onDue} />
      </div>

      <div>
        <PrioritySelect value={priority} onChange={onPriority} />
      </div>

      <RowMenu onDelete={onDelete} />
    </div>
  );
}

function RowMenu({ onDelete }: { onDelete: () => void }) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setMenu((v) => !v)}
        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {menu && (
        <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:bg-[#111] dark:border-white/10">
          <button className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10">
            Edit
          </button>
          <button className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10">
            Duplicate
          </button>
          <button
            onClick={() => {
              setMenu(false);
              onDelete();
            }}
            className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
