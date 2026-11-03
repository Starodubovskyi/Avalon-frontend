"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { CalendarDays, History, Users } from "lucide-react";
import { toast } from "sonner";
import { VesselsApi } from "@/lib/api/vessels";
import { useErrorText } from "@/lib/api/errorText";
import { useNames } from "../network/useNames";
import { useEventFeed } from "@/lib/vessels/hooks";
import { type VesselEventView } from "@/lib/vessels/types";
import { Avatar, btn, EmptyState, ErrorBlock, LoadingBlock, PageHeader, Panel, SelectInput, Spinner } from "../ui/primitives";
import { HistoryList } from "../vessels/HistoryList";

const PAGE = 200;

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

type Relative = "today" | "yesterday" | null;

function dayRelation(d: Date, now: Date): Relative {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dayKey(d) === dayKey(now)) return "today";
  if (dayKey(d) === dayKey(yesterday)) return "yesterday";
  return null;
}

interface DayGroup {
  key: string;
  date: Date;
  relation: Relative;
  events: VesselEventView[];
  authors: string[];
}

function AuthorStack({ names }: { names: string[] }) {
  const t = useTranslations("activity");
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
      <span className="sr-only">{t("changesBy", { names: names.join(", ") })}</span>
    </div>
  );
}

export function ActivityView() {
  const t = useTranslations("activity");
  const errorText = useErrorText();
  const names = useNames();
  const format = useFormatter();
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
    for (const ev of events) if (ev.user) map.set(String(ev.user.id), names.user(ev.user));
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [events, names]);

  const groups = useMemo<DayGroup[]>(() => {
    const now = new Date();
    const filtered = events.filter((ev) => !author || String(ev.user?.id) === author);
    const byDay = new Map<string, DayGroup>();
    for (const ev of filtered) {
      const d = new Date(ev.createdAt);
      const key = dayKey(d);
      let group = byDay.get(key);
      if (!group) {
        group = { key, date: d, relation: dayRelation(d, now), events: [], authors: [] };
        byDay.set(key, group);
      }
      group.events.push(ev);
      const name = names.user(ev.user);
      if (!group.authors.includes(name)) group.authors.push(name);
    }
    return Array.from(byDay.values());
  }, [events, author, names]);

  async function loadOlder() {
    const last = events[events.length - 1];
    if (!last) return;
    setLoadingMore(true);
    try {
      const page = await VesselsApi.feed(PAGE, { createdAt: last.createdAt, id: last.id });
      setOlder((prev) => [...prev, ...page]);
      if (page.length < PAGE) setHasMore(false);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setLoadingMore(false);
    }
  }

  const thisYear = new Date().getFullYear();
  const dayTitle = (d: Date) =>
    format.dateTime(d, { weekday: "long", day: "2-digit", month: "long", ...(d.getFullYear() === thisYear ? {} : { year: "numeric" }) });

  const canLoadMore = hasMore && (data?.length ?? 0) >= PAGE;
  const authorName = authors.find(([id]) => id === author)?.[1];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="relative w-full sm:w-60">
            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <SelectInput value={author} onChange={(e) => setAuthor(e.target.value)} className="pl-9" aria-label={t("filterLabel")}>
              <option value="">{t("allEmployees")}</option>
              {authors.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </SelectInput>
          </div>
        }
      />

      {data ? (
        <p className="tabular text-xs text-muted-foreground">
          {t("summary", { changes: groups.reduce((n, g) => n + g.events.length, 0), days: groups.length })}
          {authorName ? ` · ${t("byAuthor", { name: authorName })}` : ` · ${t("employees", { count: authors.length })}`}
        </p>
      ) : null}

      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label={t("loading")} /> : null}

      {data && groups.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<History className="h-7 w-7" />}
            title={author ? t("emptyAuthorTitle") : t("emptyTitle")}
            text={author ? t("emptyAuthorText") : t("emptyText")}
          />
        </Panel>
      ) : null}

      <div className="space-y-4">
        {groups.map((g) => (
          <Panel
            key={g.key}
            title={g.relation ? t(g.relation) : dayTitle(g.date)}
            description={`${g.relation ? `${dayTitle(g.date)} · ` : ""}${t("changes", { count: g.events.length })}`}
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
            {t("loadOlder")}
          </button>
        </div>
      ) : data && events.length > 0 ? (
        <p className="text-center text-xs text-muted-foreground">{t("beginning")}</p>
      ) : null}
    </div>
  );
}
