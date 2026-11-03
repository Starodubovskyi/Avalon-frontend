"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Anchor, ArrowRight, CircleDot, Clock3, History, Ship, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit, displayName } from "@/lib/auth/roles";
import { useEventFeed, useVessels } from "@/lib/vessels/hooks";
import { ErrorBlock, KpiTile, LoadingBlock, Panel } from "../ui/primitives";
import { HistoryList } from "../vessels/HistoryList";
import { OverviewHero } from "./OverviewHero";
import { ActiveVesselsPanel, ArrivalsPanel, AttentionPanel, ByPortPanel } from "./OverviewPanels";
import { QuickActions } from "./QuickActions";
import { useOverviewStats, type OverviewStats } from "./useOverviewStats";

function StageKpis({ stats, staff }: { stats: OverviewStats; staff: boolean }) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  return (
    <div
      className={cn(
        "stagger grid grid-cols-2 gap-3 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1",
        staff ? "lg:grid-cols-5" : "lg:grid-cols-4",
      )}
    >
      <KpiTile
        label={tc("stage.expected")}
        value={stats.expected}
        tone="expected"
        icon={<Clock3 />}
        hint={t("kpi.within72", { count: stats.arriving.length })}
        href="/vessels?view=expected"
      />
      <KpiTile label={tc("stage.at_roads")} value={stats.roads} tone="roads" icon={<Anchor />} hint={t("kpi.roadsHint")} href="/vessels?view=at_roads" />
      <KpiTile label={tc("stage.in_port")} value={stats.port} tone="port" icon={<CircleDot />} hint={t("kpi.portHint")} href="/vessels?view=in_port" />
      <KpiTile label={t("kpi.sailed30")} value={stats.sailed30} tone="departed" icon={<Ship />} hint={t("kpi.sailedHint")} href="/vessels?view=departed" />
      {staff ? (
        <KpiTile
          label={t("kpi.unpaid")}
          value={stats.unpaid.length}
          tone={stats.unpaid.length ? "unpaid" : "default"}
          icon={<TriangleAlert />}
          hint={t("kpi.pdaMissing", { count: stats.pdaMissing })}
          href="/vessels?view=unpaid"
        />
      ) : null}
    </div>
  );
}

function RecentActivity({ className }: { className?: string }) {
  const t = useTranslations("dashboard");
  const { data: feed } = useEventFeed(12);
  return (
    <Panel
      title={t("activity.title")}
      icon={<History />}
      className={className}
      action={
        <Link
          href="/activity"
          className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          {t("activity.fullLog")} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      }
    >
      {feed ? <HistoryList events={feed} showVessel /> : <LoadingBlock />}
    </Panel>
  );
}

/** Executive overview: greeting with Danube time, stage KPIs, what needs attention, arrivals and shortcuts */
export function OverviewView() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const staff = canEdit(user);
  const { data, error, isLoading, mutate } = useVessels("all");
  const stats = useOverviewStats(data);

  if (error && !data) return <ErrorBlock error={error} onRetry={() => void mutate()} />;
  if (isLoading && !data) return <LoadingBlock label={t("loading")} />;

  const firstName = user?.firstName || displayName(user);

  return (
    <div className="space-y-6">
      <OverviewHero firstName={firstName} stats={stats} staff={staff} />
      <StageKpis stats={stats} staff={staff} />

      <div className="grid gap-5 xl:grid-cols-3">
        {staff ? <AttentionPanel stats={stats} className="xl:col-span-2" /> : <ActiveVesselsPanel stats={stats} className="xl:col-span-2" />}
        <div className="space-y-5">
          <QuickActions staff={staff} />
          <ArrivalsPanel stats={stats} />
        </div>
        {staff ? <RecentActivity className="xl:col-span-2" /> : null}
        <ByPortPanel stats={stats} className={staff ? undefined : "xl:col-span-3"} />
      </div>
    </div>
  );
}
