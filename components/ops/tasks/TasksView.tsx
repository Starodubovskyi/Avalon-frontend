"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlarmClock, CalendarClock, Check, CircleAlert, ListChecks, Search, Ship } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import { useVessels, useVesselMutations } from "@/lib/vessels/hooks";
import { compareVessels } from "@/lib/vessels/status";
import { URGENCY_ORDER, deriveTasks, doneInput, type TaskReason, type TaskUrgency, type VesselTask } from "@/lib/vessels/tasks";
import { CHECKLIST, type ChecklistItemDef } from "@/lib/vessels/status";
import { useChecklistLabels, useVesselFormat, useVesselLabels } from "@/lib/vessels/i18n";
import { EmptyState, ErrorBlock, KpiTile, LoadingBlock, PageHeader, Panel, TextInput } from "../ui/primitives";
import { StageBadge } from "../ui/StageBadge";
import { VesselTypeIcon } from "../vessels/VesselTypeIcon";

type Phase = "all" | "arrival" | "finance" | "departure";

/** Tab labels: tasks.phases.<key> */
const PHASES: Phase[] = ["all", "arrival", "finance", "departure"];

const URGENCY_STYLE: Record<TaskUrgency, { dot: string; icon: typeof AlarmClock; chip: string }> = {
  overdue: { dot: "bg-bad", icon: CircleAlert, chip: "bg-bad/10 text-bad" },
  now: { dot: "bg-stage-roads", icon: AlarmClock, chip: "bg-stage-roads/10 text-stage-roads" },
  upcoming: { dot: "bg-stage-expected", icon: CalendarClock, chip: "bg-stage-expected/10 text-stage-expected" },
};

/** Urgency reason in the interface language */
function useReasonText() {
  const t = useTranslations("tasks.reason");
  const fmt = useVesselFormat();
  return (why: TaskReason) => ("at" in why ? t(why.code, { when: fmt.relative(why.at) }) : t(why.code));
}

function TaskRow({
  task,
  item,
  editable,
  busy,
  onDone,
}: {
  task: VesselTask;
  item: ChecklistItemDef;
  editable: boolean;
  busy: boolean;
  onDone: () => void;
}) {
  const t = useTranslations("tasks");
  const labels = useVesselLabels();
  const reasonText = useReasonText();
  const v = task.vessel;
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/70 px-5 py-3 first:border-t-0">
      {editable ? (
        <button
          type="button"
          onClick={onDone}
          disabled={busy}
          title={t("markDone", { item: item.label })}
          aria-label={t("markDoneFor", { item: item.label, vessel: v.name })}
          className="group flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-bad/40 bg-bad/5 text-transparent transition hover:border-ok hover:bg-ok/10 hover:text-ok disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
        </button>
      ) : (
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", URGENCY_STYLE[task.urgency].dot)} aria-hidden />
      )}
      <div className="min-w-[180px] flex-1">
        <p className="text-sm font-semibold">{item.label}</p>
        <p className="text-xs text-muted-foreground">{item.hint}</p>
      </div>
      <Link href={`/vessels/${v.id}`} className="flex min-w-[200px] items-center gap-2.5 hover:text-primary">
        <VesselTypeIcon vessel={v} size="sm" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{v.name}</span>
          <span className="block text-xs text-muted-foreground">{labels.destination(v.destination)}</span>
        </span>
      </Link>
      <StageBadge stage={v.stage} compact />
      <span className="tabular w-full text-xs text-muted-foreground sm:w-44 sm:text-right">{reasonText(task.why)}</span>
    </li>
  );
}

/** Operational to-do list: every checklist item still red on the vessels board */
export function TasksView() {
  const t = useTranslations("tasks");
  const labels = useVesselLabels();
  const items = useChecklistLabels();
  const { user } = useAuth();
  const editable = canEdit(user);
  const { data, error, isLoading, mutate } = useVessels("all");
  const { update } = useVesselMutations();
  const [phase, setPhase] = useState<Phase>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const tasks = useMemo(() => deriveTasks((data ?? []).slice().sort(compareVessels)), [data]);
  const itemOf = (task: VesselTask) => items.find((i) => i.key === task.item.key) ?? task.item;
  const q = query.trim().toLowerCase();
  // Search matches the translated item name and the English one (PRE IN, MSW…)
  const shown = tasks.filter(
    (task) =>
      (phase === "all" || task.item.phase === phase) &&
      (!q ||
        task.vessel.name.toLowerCase().includes(q) ||
        itemOf(task).label.toLowerCase().includes(q) ||
        (CHECKLIST.find((c) => c.key === task.item.key)?.label ?? "").toLowerCase().includes(q)),
  );
  const count = (u: TaskUrgency) => tasks.filter((task) => task.urgency === u).length;
  const vesselsAffected = new Set(tasks.map((task) => task.vessel.id)).size;

  async function markDone(task: VesselTask) {
    setBusy((s) => new Set(s).add(task.id));
    try {
      await update(task.vessel.id, doneInput(task.item.key), t("doneToast", { item: itemOf(task).label, vessel: task.vessel.name }));
    } catch {
      /* toast shown by the mutation */
    } finally {
      setBusy((s) => {
        const next = new Set(s);
        next.delete(task.id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={editable ? t("subtitleStaff") : t("subtitleViewer")}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile label={t("kpi.open")} value={tasks.length} icon={<ListChecks className="h-4 w-4" />} hint={t("kpi.vessels", { count: vesselsAffected })} />
        <KpiTile label={labels.urgency("overdue")} value={count("overdue")} tone="unpaid" icon={<CircleAlert className="h-4 w-4" />} hint={t("kpi.overdueHint")} />
        <KpiTile label={labels.urgency("now")} value={count("now")} tone="roads" icon={<AlarmClock className="h-4 w-4" />} hint={t("kpi.nowHint")} />
        <KpiTile label={labels.urgency("upcoming")} value={count("upcoming")} tone="expected" icon={<CalendarClock className="h-4 w-4" />} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 shadow-card" role="tablist" aria-label={t("phaseAria")}>
          {PHASES.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={phase === p}
              onClick={() => setPhase(p)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition",
                phase === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {t(`phases.${p}`)}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" aria-label={t("searchAria")} />
        </div>
      </div>

      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label={t("loading")} /> : null}
      {data && !shown.length ? (
        <div className="rounded-2xl border bg-card shadow-card">
          <EmptyState
            icon={tasks.length ? <Search className="h-7 w-7" /> : <Ship className="h-7 w-7" />}
            title={tasks.length ? t("emptyFilteredTitle") : t("emptyTitle")}
            text={tasks.length ? t("emptyFilteredText") : t("emptyText")}
          />
        </div>
      ) : null}

      {URGENCY_ORDER.map((u) => {
        const rows = shown.filter((task) => task.urgency === u);
        if (!rows.length) return null;
        const Icon = URGENCY_STYLE[u].icon;
        return (
          <Panel
            key={u}
            title={
              <span className="flex items-center gap-2">
                {labels.urgency(u)}
                <span className={cn("tabular rounded-full px-2 py-0.5 text-[11px] font-bold", URGENCY_STYLE[u].chip)}>{rows.length}</span>
              </span>
            }
            icon={<Icon className="h-4 w-4" />}
            bodyClassName="p-0"
          >
            <ul>
              {rows.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  item={itemOf(task)}
                  editable={editable}
                  busy={busy.has(task.id)}
                  onDone={() => void markDone(task)}
                />
              ))}
            </ul>
          </Panel>
        );
      })}
    </div>
  );
}
