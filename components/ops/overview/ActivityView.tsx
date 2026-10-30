"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { VesselsApi } from "@/lib/api/vessels";
import { extractAuthError } from "@/lib/api/auth";
import { useEventFeed } from "@/lib/vessels/hooks";
import { userName, type VesselEventView } from "@/lib/vessels/types";
import { ErrorBlock, LoadingBlock, PageHeader, Panel, SelectInput, Spinner } from "../ui/primitives";
import { HistoryList } from "../vessels/HistoryList";

const PAGE = 200;
const DAY_FMT = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "2-digit", month: "long" });

export function ActivityView() {
  const { data, error, isLoading, mutate } = useEventFeed(PAGE);
  const [older, setOlder] = useState<VesselEventView[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [author, setAuthor] = useState("");

  const events = useMemo(() => {
    const seen = new Set<string>();
    return [...(data ?? []), ...older].filter((ev) => (seen.has(ev.id) ? false : (seen.add(ev.id), true)));
  }, [data, older]);

  const authors = useMemo(() => {
    const map = new Map<string, string>();
    for (const ev of events) if (ev.user) map.set(String(ev.user.id), userName(ev.user));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [events]);

  const groups = useMemo(() => {
    const filtered = events.filter((ev) => !author || String(ev.user?.id) === author);
    const byDay = new Map<string, VesselEventView[]>();
    for (const ev of filtered) {
      const day = DAY_FMT.format(new Date(ev.createdAt));
      byDay.set(day, [...(byDay.get(day) ?? []), ev]);
    }
    return Array.from(byDay.entries());
  }, [events, author]);

  async function loadOlder() {
    const last = events[events.length - 1];
    if (!last) return;
    setLoadingMore(true);
    try {
      const page = await VesselsApi.feed(PAGE, { createdAt: last.createdAt, id: last.id });
      setOlder((prev) => [...prev, ...page]);
      if (page.length < PAGE) setHasMore(false);
    } catch (e) {
      toast.error(extractAuthError(e));
    } finally {
      setLoadingMore(false);
    }
  }

  const canLoadMore = hasMore && (data?.length ?? 0) >= PAGE;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity log"
        subtitle="Every change to a vessel, signed with the employee's name."
        actions={
          <SelectInput value={author} onChange={(e) => setAuthor(e.target.value)} className="w-52" aria-label="Filter by employee">
            <option value="">All employees</option>
            {authors.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </SelectInput>
        }
      />
      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label="Loading activity…" /> : null}
      {data && groups.length === 0 ? (
        <Panel>
          <HistoryList events={[]} />
        </Panel>
      ) : null}
      {groups.map(([day, dayEvents]) => (
        <Panel key={day} title={day}>
          <HistoryList events={dayEvents} showVessel />
        </Panel>
      ))}
      {canLoadMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void loadOlder()}
            disabled={loadingMore}
            className="flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            {loadingMore ? <Spinner className="h-4 w-4" /> : null}
            Load older changes
          </button>
        </div>
      ) : null}
    </div>
  );
}
