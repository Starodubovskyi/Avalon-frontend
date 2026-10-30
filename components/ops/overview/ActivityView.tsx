"use client";

import { useMemo, useState } from "react";
import { CalendarDays, History, Users } from "lucide-react";
import { toast } from "sonner";
import { VesselsApi } from "@/lib/api/vessels";
import { extractAuthError } from "@/lib/api/auth";
import { useEventFeed } from "@/lib/vessels/hooks";
import { userName, type VesselEventView } from "@/lib/vessels/types";
import { Avatar, btn, EmptyState, ErrorBlock, LoadingBlock, PageHeader, Panel, SelectInput, Spinner } from "../ui/primitives";
import { HistoryList } from "../vessels/HistoryList";

const PAGE = 200;
const DAY_FMT = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "2-digit", month: "long" });
const DAY_FMT_YEAR = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(d: Date, now: Date): { title: string; subtitle: string } {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const full = (d.getFullYear() === now.getFullYear() ? DAY_FMT : DAY_FMT_YEAR).format(d);
  if (dayKey(d) === dayKey(now)) return { title: "Today", subtitle: full };
  if (dayKey(d) === dayKey(yesterday)) return { title: "Yesterday", subtitle: full };
  return { title: full, subtitle: "" };
}

interface DayGroup {
  key: string;
  title: string;
  subtitle: string;
  events: VesselEventView[];
  authors: string[];
}

function AuthorStack({ names }: { names: string[] }) {
  const shown = names.slice(0, 3);
  const extra = names.length - shown.length;
  return (
    <div className="flex items-center -space-x-2" title={names.join(", ")}>
      {shown.map((n) => (
        <Avatar key={n} name={n} className="h-7 w-7 text-[10px] ring-2 ring-card" />
      ))}
      {extra > 0 ? (
        <span className="tabular inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-card">
          +{extra}
        </span>
      ) : null}
      <span className="sr-only">Changes by {names.join(", ")}</span>
    </div>
  );
}

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

  const groups = useMemo<DayGroup[]>(() => {
    const now = new Date();
    const filtered = events.filter((ev) => !author || String(ev.user?.id) === author);
    const byDay = new Map<string, DayGroup>();
    for (const ev of filtered) {
      const d = new Date(ev.createdAt);
      const key = dayKey(d);
      let group = byDay.get(key);
      if (!group) {
        group = { key, ...dayLabel(d, now), events: [], authors: [] };
        byDay.set(key, group);
      }
      group.events.push(ev);
      const name = userName(ev.user);
      if (!group.authors.includes(name)) group.authors.push(name);
    }
    return Array.from(byDay.values());
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
  const authorName = authors.find(([id]) => id === author)?.[1];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Activity log"
        subtitle="Every change to a vessel, signed with the employee's name."
        actions={
          <div className="relative w-full sm:w-60">
            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <SelectInput value={author} onChange={(e) => setAuthor(e.target.value)} className="pl-9" aria-label="Filter by employee">
              <option value="">All employees</option>
              {authors.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </SelectInput>
          </div>
        }
      />

      {data ? (
        <p className="tabular text-xs text-muted-foreground">
          {groups.reduce((n, g) => n + g.events.length, 0)} changes across {groups.length} {groups.length === 1 ? "day" : "days"}
          {authorName ? ` by ${authorName}` : ` · ${authors.length} ${authors.length === 1 ? "employee" : "employees"}`}
        </p>
      ) : null}

      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label="Loading activity…" /> : null}

      {data && groups.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<History className="h-7 w-7" />}
            title={author ? "No changes by this employee" : "No changes yet"}
            text={author ? "Pick another employee or load older changes." : "Edits to vessels will appear here, newest first."}
          />
        </Panel>
      ) : null}

      <div className="space-y-4">
        {groups.map((g) => (
          <Panel
            key={g.key}
            title={g.title}
            description={`${g.subtitle ? `${g.subtitle} · ` : ""}${g.events.length} ${g.events.length === 1 ? "change" : "changes"}`}
            icon={<CalendarDays className="h-4 w-4" />}
            action={<AuthorStack names={g.authors} />}
          >
            <div className="pl-1.5">
              <HistoryList events={g.events} showVessel />
            </div>
          </Panel>
        ))}
      </div>

      {canLoadMore ? (
        <div className="flex justify-center pt-1">
          <button type="button" onClick={() => void loadOlder()} disabled={loadingMore} className={btn.secondary}>
            {loadingMore ? <Spinner className="h-4 w-4" /> : <History className="h-4 w-4" />}
            Load older changes
          </button>
        </div>
      ) : data && events.length > 0 ? (
        <p className="text-center text-xs text-muted-foreground">You have reached the beginning of the log.</p>
      ) : null}
    </div>
  );
}
