"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Search, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/network/hooks";
import { useAgencyRequests } from "@/lib/requests/hooks";
import { REQUEST_STATUSES, REQUEST_STATUS_META, type AgencyRequest, type RequestStatus } from "@/lib/requests/types";
import { EmptyState, ErrorBlock, LoadingBlock, PageHeader, TextInput, btn } from "../ui/primitives";
import { RequestCard } from "./RequestCard";

type Tab = RequestStatus | "all";

const TABS: { id: Tab; label: string }[] = [
  ...REQUEST_STATUSES.map((s) => ({ id: s, label: REQUEST_STATUS_META[s].label })),
  { id: "all", label: "All" },
];

function matches(r: AgencyRequest, q: string): boolean {
  if (!q) return true;
  return [r.vesselName, r.imo, r.company, r.contactName, r.email, r.cargo].some((v) => (v ?? "").toLowerCase().includes(q));
}

export function RequestsInbox() {
  const { data, error, isLoading, mutate } = useAgencyRequests();
  const now = useNow();
  const [tab, setTab] = useState<Tab>("new");
  const [query, setQuery] = useState("");
  // Cards handled in this tab stay put until the tab changes, so a status change doesn't yank the card away mid-reply
  const [kept, setKept] = useState<string[]>([]);
  const keep = useCallback((id: string) => setKept((k) => (k.includes(id) ? k : [...k, id])), []);

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { new: 0, quoted: 0, accepted: 0, declined: 0, all: data?.length ?? 0 };
    for (const r of data ?? []) c[r.status] += 1;
    return c;
  }, [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((r) => (tab === "all" || r.status === tab || kept.includes(r.id)) && matches(r, q));
  }, [data, tab, query, kept]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Clients"
        title="Agency requests"
        subtitle="Reply to clients, send terms, and put accepted calls on the board in one click."
        actions={
          <Link href="/request" className={btn.secondary}>
            <Send className="h-4 w-4" aria-hidden /> New request
          </Link>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-2 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist" aria-label="Filter by status">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                setKept([]);
              }}
              className={cn(
                "flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl px-3.5 text-[13px] font-semibold transition-all",
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-[0_6px_16px_-8px_hsl(var(--primary))]"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "tabular min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold",
                  tab === t.id
                    ? "bg-white/20"
                    : t.id === "new" && counts.new > 0
                      ? "bg-stage-expected text-white"
                      : "bg-muted text-foreground/70",
                )}
              >
                {counts[t.id]}
              </span>
            </button>
          ))}
        </div>
        <div className="relative p-1 lg:w-72 lg:p-0">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground lg:left-3" />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vessel, IMO, company…"
            className="pl-9"
            aria-label="Search requests"
          />
        </div>
      </div>

      {error ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label="Loading requests…" /> : null}

      {data && rows.length === 0 ? (
        <div className="rounded-2xl border bg-card shadow-card">
          <EmptyState
            icon={<ClipboardList className="h-8 w-8" />}
            title={data.length ? "Nothing in this tab" : "No requests yet"}
            text={
              data.length
                ? query
                  ? "No request matches the search."
                  : "Try another status tab."
                : "Client requests from the Request agency form will land here."
            }
          />
        </div>
      ) : null}

      {rows.length ? (
        <ul className="space-y-3">
          {rows.map((r) => (
            <RequestCard key={r.id} request={r} now={now} onTouch={keep} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
