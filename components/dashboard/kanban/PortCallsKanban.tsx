"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useMemo } from "react";
import { useDashboardStore } from "../store";
import type { PortCallStatus } from "../types";
import clsx from "clsx";

const COLUMNS: { id: PortCallStatus; label: string }[] = [
  { id: "Scheduled", label: "Scheduled" },
  { id: "Alongside", label: "Alongside" },
  { id: "Departed",  label: "Departed" },
  { id: "Cancelled", label: "Cancelled" },
];

export default function PortCallsKanban() {
  const { portCalls, vessels, updatePortCallStatus } = useDashboardStore();

  const byCol = useMemo(() => {
    const map: Record<PortCallStatus, { id: string; title: string; sub: string }[]> = {
      Scheduled: [],
      Alongside: [],
      Departed: [],
      Cancelled: [],
    };
    for (const p of portCalls) {
      const v = vessels.find((x) => x.id === p.vesselId);
      map[p.status].push({
        id: p.id,
        title: `${v?.name || "Vessel"} — ${p.port}${p.berth ? `, ${p.berth}` : ""}`,
        sub: new Date(p.etaIso).toLocaleString(),
      });
    }
    return map;
  }, [portCalls, vessels]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    const destCol = (e.over?.id as PortCallStatus | undefined) || null;
    if (!destCol) return;
    const pc = portCalls.find((p) => p.id === id);
    if (!pc || pc.status === destCol) return;
    updatePortCallStatus(id, destCol);
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 p-4 bg-white/70 dark:bg-white/5">
      <div className="text-sm opacity-70 mb-3">Port Calls — Kanban</div>
      <DndContext sensors={sensors} modifiers={[restrictToWindowEdges]} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <Column key={col.id} id={col.id} label={col.label} items={byCol[col.id]} />
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
      className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 p-3"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs opacity-60">{items.length}</div>
      </div>
      <div className="mt-3 space-y-2 min-h-24">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((card) => (
            <Card key={card.id} id={card.id} title={card.title} sub={card.sub} />
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
        "cursor-grab active:cursor-grabbing rounded-lg border border-gray-200 dark:border-white/10",
        "bg-white dark:bg-white/5 p-3"
      )}
    >
      <div className="text-sm">{title}</div>
      <div className="text-xs opacity-70 mt-1">{sub}</div>
    </div>
  );
}
