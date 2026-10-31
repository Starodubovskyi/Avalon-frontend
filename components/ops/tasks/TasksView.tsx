"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlarmClock, CalendarClock, Check, CircleAlert, ListChecks, Search, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import { useVessels, useVesselMutations } from "@/lib/vessels/hooks";
import { compareVessels } from "@/lib/vessels/status";
import { DESTINATION_LABEL } from "@/lib/vessels/types";
import { URGENCY_LABEL, URGENCY_ORDER, deriveTasks, doneInput, type TaskUrgency, type VesselTask } from "@/lib/vessels/tasks";
import { EmptyState, ErrorBlock, KpiTile, LoadingBlock, PageHeader, Panel, TextInput } from "../ui/primitives";
import { StageBadge } from "../ui/StageBadge";
import { VesselTypeIcon } from "../vessels/VesselTypeIcon";

type Phase = "all" | "arrival" | "finance" | "departure";

const PHASES: { key: Phase; label: string }[] = [
  { key: "all", label: "All" },
  { key: "arrival", label: "Arrival" },
  { key: "finance", label: "PDA & payment" },
  { key: "departure", label: "Departure" },
];

const URGENCY_STYLE: Record<TaskUrgency, { dot: string; icon: typeof AlarmClock; chip: string }> = {
  overdue: { dot: "bg-bad", icon: CircleAlert, chip: "bg-bad/10 text-bad" },
  now: { dot: "bg-stage-roads", icon: AlarmClock, chip: "bg-stage-roads/10 text-stage-roads" },
  upcoming: { dot: "bg-stage-expected", icon: CalendarClock, chip: "bg-stage-expected/10 text-stage-expected" },
};

function TaskRow({ task, editable, busy, onDone }: { task: VesselTask; editable: boolean; busy: boolean; onDone: () => void }) {
  const v = task.vessel;
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 px-5 py-3 first:border-t-0">
      {editable ? (
        <button
          type="button"
          onClick={onDone}
          disabled={busy}
          title={`Mark ${task.item.label} done`}
          aria-label={`Mark ${task.item.label} done for ${v.name}`}
          className="group flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-bad/40 bg-bad/5 text-transparent transition hover:border-ok hover:bg-ok/10 hover:text-ok disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
        </button>
      ) : (
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", URGENCY_STYLE[task.urgency].dot)} aria-hidden />
      )}
      <div className="min-w-[180px] flex-1">
        <p className="text-sm font-semibold">{task.item.label}</p>
        <p className="text-xs text-muted-foreground">{task.item.hint}</p>
      </div>
      <Link href={`/vessels/${v.id}`} className="flex min-w-[200px] items-center gap-2.5 hover:text-primary">
        <VesselTypeIcon vessel={v} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{v.name}</span>
          <span className="block text-xs text-muted-foreground">{DESTINATION_LABEL[v.destination]}</span>
        </span>
      </Link>
      <StageBadge stage={v.stage} compact />
      <span className="tabular w-full text-xs text-muted-foreground sm:w-44 sm:text-right">{task.reason}</span>
    </li>
  );
}

/** Operational to-do list: every checklist item still red on the vessels board */
export function TasksView() {
  const { user } = useAuth();
  const editable = canEdit(user);
  const { data, error, isLoading, mutate } = useVessels("all");
  const { update } = useVesselMutations();
  const [phase, setPhase] = useState<Phase>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const tasks = useMemo(() => deriveTasks((data ?? []).slice().sort(compareVessels)), [data]);
  const q = query.trim().toLowerCase();
  const shown = tasks.filter(
    (t) => (phase === "all" || t.item.phase === phase) && (!q || t.vessel.name.toLowerCase().includes(q) || t.item.label.toLowerCase().includes(q)),
  );
  const count = (u: TaskUrgency) => tasks.filter((t) => t.urgency === u).length;
  const vesselsAffected = new Set(tasks.map((t) => t.vessel.id)).size;

  async function markDone(t: VesselTask) {
    setBusy((s) => new Set(s).add(t.id));
    try {
      await update(t.vessel.id, doneInput(t.item.key), `${t.item.label} done · ${t.vessel.name}`);
    } catch {
      /* toast shown by the mutation */
    } finally {
      setBusy((s) => {
        const next = new Set(s);
        next.delete(t.id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Tasks"
        subtitle={
          editable
            ? "Everything still red on the vessels board. Tick an item when it is done — the board turns it green for everyone."
            : "Everything still open on the vessels you can see."
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label="Open tasks" value={tasks.length} icon={<ListChecks className="h-4 w-4" />} hint={`${vesselsAffected} vessels`} />
        <KpiTile label="Overdue" value={count("overdue")} tone="unpaid" icon={<CircleAlert className="h-4 w-4" />} hint="vessel already moved on" />
        <KpiTile label="Due now" value={count("now")} tone="roads" icon={<AlarmClock className="h-4 w-4" />} hint="at roads or ETA < 24 h" />
        <KpiTile label="Upcoming" value={count("upcoming")} tone="expected" icon={<CalendarClock className="h-4 w-4" />} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 shadow-card" role="tablist" aria-label="Task type">
          {PHASES.map((p) => (
            <button
              key={p.key}
              type="button"
              role="tab"
              aria-selected={phase === p.key}
              onClick={() => setPhase(p.key)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition",
                phase === p.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by vessel or task" className="pl-9" aria-label="Filter tasks" />
        </div>
      </div>

      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label="Collecting open items…" /> : null}
      {data && !shown.length ? (
        <div className="rounded-2xl border bg-card shadow-card">
          <EmptyState
            icon={tasks.length ? <Search className="h-7 w-7" /> : <Ship className="h-7 w-7" />}
            title={tasks.length ? "Nothing matches the filter" : "All clear"}
            text={tasks.length ? "Try another task type or vessel name." : "Every checklist item on the board is green."}
          />
        </div>
      ) : null}

      {URGENCY_ORDER.map((u) => {
        const rows = shown.filter((t) => t.urgency === u);
        if (!rows.length) return null;
        const Icon = URGENCY_STYLE[u].icon;
        return (
          <Panel
            key={u}
            title={
              <span className="flex items-center gap-2">
                {URGENCY_LABEL[u]}
                <span className={cn("tabular rounded-full px-2 py-0.5 text-[11px] font-bold", URGENCY_STYLE[u].chip)}>{rows.length}</span>
              </span>
            }
            icon={<Icon className="h-4 w-4" />}
            bodyClassName="p-0"
          >
            <ul>
              {rows.map((t) => (
                <TaskRow key={t.id} task={t} editable={editable} busy={busy.has(t.id)} onDone={() => void markDone(t)} />
              ))}
            </ul>
          </Panel>
        );
      })}
    </div>
  );
}
