"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Anchor, Lock, Plus, Search, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PortsApi, type PortStatus } from "@/lib/api/ports";
import { useErrorText } from "@/lib/api/errorText";
import { useAuth } from "@/lib/auth/useAuth";
import { isAdmin } from "@/lib/auth/roles";
import { btn, EmptyState, ErrorBlock, LoadingBlock, PageHeader, Panel, TextInput } from "../ui/primitives";
import { PortFormDialog } from "./PortFormDialog";
import { PortList } from "./PortList";
import { PORT_STATUS_META, usePortStatusLabel } from "./PortStatusBadge";
import { PORT_STATUSES, toPortRow, useNow, type PortRow } from "./portUtils";

const LIMIT = 100;

function StatusCard({
  label,
  count,
  icon: Icon,
  active,
  tint,
  onClick,
}: {
  label: string;
  count: number;
  icon: LucideIcon;
  active: boolean;
  tint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-card transition",
        "hover:-translate-y-0.5 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
        active && "border-primary/50 ring-1 ring-primary/30",
      )}
    >
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tint)}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="tabular block font-display text-2xl font-bold leading-none">{count}</span>
        <span className="mt-1 block truncate text-xs font-medium text-muted-foreground">{label}</span>
      </span>
    </button>
  );
}

export function PortsView() {
  const t = useTranslations("ports");
  const errorText = useErrorText();
  const statusLabel = usePortStatusLabel();
  const { user } = useAuth();
  const admin = isAdmin(user);
  const now = useNow();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PortStatus | "">("");
  const [editing, setEditing] = useState<PortRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setQuery(search.trim()), 250);
    return () => window.clearTimeout(id);
  }, [search]);

  const { data, error, isLoading, mutate } = useSWR(
    ["ports", query] as const,
    () => PortsApi.list({ search: query || undefined, limit: LIMIT }),
    { keepPreviousData: true },
  );

  const rows = useMemo(() => (data ?? []).map(toPortRow), [data]);
  const counts = useMemo(() => {
    const c: Record<PortStatus, number> = { Open: 0, Congested: 0, Closed: 0 };
    for (const r of rows) c[r.status] += 1;
    return c;
  }, [rows]);
  const visible = status ? rows.filter((r) => r.status === status) : rows;

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(row: PortRow) {
    setEditing(row);
    setDialogOpen(true);
  }

  async function remove(row: PortRow) {
    if (!window.confirm(t("confirmDelete", { name: row.name, code: row.unlocode }))) return;
    setBusyId(row.id);
    try {
      await PortsApi.remove(row.id);
      await mutate();
      toast.success(t("deleted", { name: row.name }));
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          admin ? (
            <button type="button" onClick={openCreate} className={btn.primary}>
              <Plus className="h-4 w-4" /> {t("add")}
            </button>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatusCard
          label={t("allPorts")}
          count={rows.length}
          icon={Anchor}
          active={status === ""}
          tint="bg-primary/10 text-primary"
          onClick={() => setStatus("")}
        />
        {PORT_STATUSES.map((s) => {
          const meta = PORT_STATUS_META[s];
          return (
            <StatusCard
              key={s}
              label={statusLabel(s)}
              count={counts[s]}
              icon={meta.icon}
              active={status === s}
              tint={meta.chip}
              onClick={() => setStatus(status === s ? "" : s)}
            />
          );
        })}
      </div>

      <Panel bodyClassName="p-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <TextInput
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-9"
              aria-label={t("searchAria")}
            />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="tabular">
              {t("count", { count: visible.length })}
              {status ? ` · ${statusLabel(status).toLowerCase()}` : ""}
            </span>
            {!admin ? (
              <span className="inline-flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" aria-hidden /> {t("readOnly")}
              </span>
            ) : null}
          </div>
        </div>

        {error && !data ? (
          <div className="p-5">
            <ErrorBlock error={error} onRetry={() => void mutate()} />
          </div>
        ) : isLoading && !data ? (
          <LoadingBlock label={t("loading")} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<Anchor className="h-7 w-7" />}
            title={query || status ? t("emptyFilteredTitle") : t("emptyTitle")}
            text={query || status ? t("emptyFilteredText") : t("emptyText")}
            action={
              admin && !query && !status ? (
                <button type="button" onClick={openCreate} className={btn.primary}>
                  <Plus className="h-4 w-4" /> {t("add")}
                </button>
              ) : null
            }
          />
        ) : (
          <PortList rows={visible} now={now} admin={admin} busyId={busyId} onEdit={openEdit} onDelete={(r) => void remove(r)} />
        )}

        {rows.length >= LIMIT ? (
          <p className="border-t px-5 py-3 text-xs text-muted-foreground">{t("limitNote", { limit: LIMIT })}</p>
        ) : null}
      </Panel>

      {admin ? <PortFormDialog open={dialogOpen} onOpenChange={setDialogOpen} port={editing} onSaved={() => void mutate()} /> : null}
    </div>
  );
}
