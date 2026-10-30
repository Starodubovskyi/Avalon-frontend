"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Ship } from "lucide-react";
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

const VIEWS: { id: View; label: string; staffOnly?: boolean; test: (v: VesselView) => boolean }[] = [
  { id: "work", label: "In work", test: (v) => v.stage !== "departed" || isUnpaidAfterDeparture(v) },
  { id: "expected", label: "Expected", test: (v) => v.stage === "expected" },
  { id: "at_roads", label: "At roads", test: (v) => v.stage === "at_roads" },
  { id: "in_port", label: "In port", test: (v) => v.stage === "in_port" },
  { id: "attention", label: "Open items", staffOnly: true, test: (v) => v.stage !== "departed" && pendingCount(v) > 0 },
  { id: "unpaid", label: "Sailed unpaid", staffOnly: true, test: isUnpaidAfterDeparture },
  { id: "departed", label: "Departed", test: (v) => v.stage === "departed" },
  { id: "all", label: "All", test: () => true },
];

function isView(value: string | null): value is View {
  return !!value && VIEWS.some((v) => v.id === value);
}

export function VesselBoard() {
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
        eyebrow="Operations"
        title="Vessels"
        subtitle={staff ? "Click a red item to mark it done. Everything you change is logged with your name." : "Read-only view of vessels handled by Avalon Shipping."}
        actions={
          staff ? (
            <button type="button" onClick={() => setFormOpen(true)} className={btn.primary}>
              <Plus className="h-4 w-4" /> Add vessel
            </button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-2 shadow-card xl:flex-row xl:items-center xl:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-wrap" role="tablist" aria-label="Filter by status">
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
              {v.label}
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
        <div className="flex gap-2 p-1 xl:p-0">
          <div className="relative flex-1 xl:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or IMO" className="pl-9" aria-label="Search vessels" />
          </div>
          <SelectInput value={destination} onChange={(e) => setDestination(e.target.value)} className="w-40" aria-label="Destination">
            <option value="">All ports</option>
            {DESTINATIONS.map((d) => (
              <option key={d} value={d}>{DESTINATION_LABEL[d]}</option>
            ))}
          </SelectInput>
        </div>
      </div>

      {error ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label="Loading vessels…" /> : null}

      {data && rows.length === 0 ? (
        <div className="rounded-2xl border bg-card shadow-card">
          <EmptyState
            icon={<Ship className="h-8 w-8" />}
            title={all.length ? "No vessels match this filter" : "No vessels yet"}
            text={all.length ? "Try another status tab or clear the search." : staff ? "Add the first vessel the agency is handling." : "Vessels will appear here once Avalon staff add them."}
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
