"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Ship } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import { useVessels } from "@/lib/vessels/hooks";
import { compareVessels, isUnpaidAfterDeparture, pendingCount } from "@/lib/vessels/status";
import { DESTINATIONS, DESTINATION_LABEL, type VesselView } from "@/lib/vessels/types";
import { EmptyState, ErrorBlock, LoadingBlock, PageHeader, SelectInput, TextInput, btn } from "../ui/primitives";
import { VesselTable } from "./VesselTable";
import { VesselCardList } from "./VesselCardList";
import { VesselFormDialog } from "./VesselFormDialog";

type View = "work" | "expected" | "at_roads" | "in_port" | "attention" | "unpaid" | "departed" | "all";

/** Tab labels live in messages: vessels.board.views.<id> */
const VIEWS: { id: View; staffOnly?: boolean; test: (v: VesselView) => boolean }[] = [
  { id: "work", test: (v) => v.stage !== "departed" || isUnpaidAfterDeparture(v) },
  { id: "expected", test: (v) => v.stage === "expected" },
  { id: "at_roads", test: (v) => v.stage === "at_roads" },
  { id: "in_port", test: (v) => v.stage === "in_port" },
  { id: "attention", staffOnly: true, test: (v) => v.stage !== "departed" && pendingCount(v) > 0 },
  { id: "unpaid", staffOnly: true, test: isUnpaidAfterDeparture },
  { id: "departed", test: (v) => v.stage === "departed" },
  { id: "all", test: () => true },
];

function isView(value: string | null): value is View {
  return !!value && VIEWS.some((v) => v.id === value);
}

export function VesselBoard() {
  const t = useTranslations("vessels.board");
  const params = useSearchParams();
  const requestedView = params?.get("view") ?? null;
  const { user } = useAuth();
  const staff = canEdit(user);
  const { data, error, isLoading, mutate } = useVessels("all");

  const [view, setView] = useState<View>("work");

  // Follow ?view= on every navigation (e.g. the topbar "sailed unpaid" link while already on the board)
  useEffect(() => {
    const allowed = VIEWS.find((v) => v.id === requestedView && (staff || !v.staffOnly));
    if (isView(requestedView) && allowed) setView(requestedView);
  }, [requestedView, staff]);
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const views = VIEWS.filter((v) => staff || !v.staffOnly);
  const all = useMemo(() => (data ?? []).slice().sort(compareVessels), [data]);

  const counts = useMemo(() => {
    const c = {} as Record<View, number>;
    for (const v of VIEWS) c[v.id] = all.filter(v.test).length;
    return c;
  }, [all]);

  const rows = useMemo(() => {
    const active = VIEWS.find((v) => v.id === view) ?? VIEWS[0];
    const q = query.trim().toLowerCase();
    return all.filter(
      (v) =>
        active.test(v) &&
        (!destination || v.destination === destination) &&
        (!q || v.name.toLowerCase().includes(q) || (v.imo ?? "").includes(q)),
    );
  }, [all, view, query, destination]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={staff ? t("subtitleStaff") : t("subtitleViewer")}
        actions={
          staff ? (
            <button type="button" onClick={() => setFormOpen(true)} className={btn.primary}>
              <Plus className="h-4 w-4" /> {t("add")}
            </button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-2 shadow-card xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-wrap" role="tablist" aria-label={t("filterAria")}>
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={view === v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all",
                view === v.id ? "bg-primary text-primary-foreground shadow-[0_6px_16px_-8px_hsl(var(--primary))]" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                v.id === "unpaid" && counts.unpaid > 0 && view !== v.id && "text-stage-unpaid",
              )}
            >
              {t(`views.${v.id}`)}
              <span
                className={cn(
                  "tabular min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold",
                  view === v.id ? "bg-white/20" : v.id === "unpaid" && counts.unpaid > 0 ? "bg-stage-unpaid text-white" : "bg-muted text-foreground/70",
                )}
              >
                {counts[v.id]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 p-1 sm:flex-row xl:p-0">
          <div className="relative min-w-0 flex-1 xl:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" aria-label={t("searchAria")} />
          </div>
          <SelectInput value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full sm:w-40" aria-label={t("destinationAria")}>
            <option value="">{t("allPorts")}</option>
            {DESTINATIONS.map((d) => (
              <option key={d} value={d}>{DESTINATION_LABEL[d]}</option>
            ))}
          </SelectInput>
        </div>
      </div>

      {error ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label={t("loading")} /> : null}

      {data && rows.length === 0 ? (
        <div className="rounded-2xl border bg-card shadow-card">
          <EmptyState
            icon={<Ship className="h-8 w-8" />}
            title={all.length ? t("emptyFilteredTitle") : t("emptyTitle")}
            text={all.length ? t("emptyFilteredText") : staff ? t("emptyTextStaff") : t("emptyTextViewer")}
          />
        </div>
      ) : null}

      {rows.length > 0 ? (
        <>
          <div className="hidden md:block">
            <VesselTable vessels={rows} editable={staff} />
          </div>
          <div className="md:hidden">
            <VesselCardList vessels={rows} editable={staff} />
          </div>
        </>
      ) : null}

      <VesselFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
