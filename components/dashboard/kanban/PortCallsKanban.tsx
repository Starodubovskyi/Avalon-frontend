"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useMemo } from "react";
import { useDashboardStore } from "../store";
import type { PortCallStatus } from "../types";
import clsx from "clsx";

const COLUMNS: { id: PortCallStatus; label: string }[] = [
  { id: "Scheduled", label: "Scheduled" },
  { id: "Alongside", label: "Alongside" },
  { id: "Departed", label: "Departed" },
  { id: "Cancelled", label: "Cancelled" },
];

export default function PortCallsKanban() {
  const { portCalls, vessels, updatePortCallStatus } = useDashboardStore();

  const byCol = useMemo(() => {
    const map: Record<
      PortCallStatus,
      { id: string; title: string; sub: string }[]
    > = {
      Scheduled: [],
      Alongside: [],
      Departed: [],
      Cancelled: [],
    };
    for (const p of portCalls) {
      const v = vessels.find((x) => x.id === p.vesselId);
      map[p.status].push({
        id: p.id,
        title: `${v?.name || "Vessel"} — ${p.port}${
          p.berth ? `, ${p.berth}` : ""
        }`,
        sub: new Date(p.etaIso).toLocaleString(),
      });
    }
    return map;
  }, [portCalls, vessels]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    const destCol = (e.over?.id as PortCallStatus | undefined) || null;
    if (!destCol) return;
    const pc = portCalls.find((p) => p.id === id);
    if (!pc || pc.status === destCol) return;
    updatePortCallStatus(id, destCol);
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 text-base font-bold text-zinc-900 dark:text-white">
        Port Calls — Kanban
      </div>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToWindowEdges]}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              label={col.label}
              items={byCol[col.id]}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function Column({
  id,
  label,
  items,
}: {
  id: PortCallStatus;
  label: string;
  items: { id: string; title: string; sub: string }[];
}) {
  return (
    <div
      id={id}
      className="flex flex-col rounded-2xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/20"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </div>
        <div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-200 px-1.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {items.length}
        </div>
      </div>
      <div className="flex-1 space-y-2.5 min-h-[100px]">
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((card) => (
            <Card
              key={card.id}
              id={card.id}
              title={card.title}
              sub={card.sub}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function Card({ id, title, sub }: { id: string; title: string; sub: string }) {
  return (
    <div
      id={id}
      data-id={id}
      draggable
      className={clsx(
        "cursor-grab active:cursor-grabbing rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-all",
        "hover:border-indigo-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
      )}
    >
      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </div>
      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{sub}</div>
    </div>
  );
}
