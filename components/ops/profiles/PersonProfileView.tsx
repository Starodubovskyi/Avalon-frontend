"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Phone, UserRound, UserX } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { httpStatus } from "@/lib/api/fieldErrors";
import { useProfile } from "@/lib/profiles/hooks";
import { EmptyState, ErrorBlock, Panel, btn } from "../ui/primitives";
import { mailtoHref, telHref } from "../map/PointActions";
import { PersonHero } from "./PersonHero";
import { PersonCompanies } from "./PersonCompanies";

function Skeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
        <div className="h-28 animate-pulse bg-muted sm:h-36" />
        <div className="space-y-3 px-6 pb-6">
          <div className="-mt-12 h-24 w-24 animate-pulse rounded-full bg-muted ring-4 ring-card" />
          <div className="h-7 w-1/2 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="h-24 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}

/** /people/[id]: personal page — about, companies, stats, contacts (phone only for the person and the team) */
export function PersonProfileView({ userId }: { userId: number | null }) {
  const t = useTranslations("profiles");
  const format = useFormatter();
  const { data, error, isLoading, mutate } = useProfile(userId);

  if (userId === null || (error && !data && (httpStatus(error) === 404 || httpStatus(error) === 400))) {
    return (
      <div className="rounded-3xl border bg-card shadow-card">
        <EmptyState
          icon={<UserX className="h-7 w-7" />}
          title={t("notFoundTitle")}
          text={t("notFoundText")}
          action={
            <Link href="/people" className={btn.primary}>
              <ArrowLeft className="h-4 w-4" /> {t("back")}
            </Link>
          }
        />
      </div>
    );
  }
  if (error && !data) return <ErrorBlock error={new Error(t("loadError"))} onRetry={() => void mutate()} />;
  if (isLoading || !data) return <Skeleton />;

  const stats: [string, number][] = [
    [t("stats.points"), data.stats.points],
    [t("stats.posts"), data.stats.posts],
    [t("stats.followers"), data.stats.followers],
    [t("stats.following"), data.stats.following],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <PersonHero profile={data} />
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border bg-card px-4 py-3 shadow-card">
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="tabular mt-0.5 font-display text-2xl font-bold">{format.number(value)}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="min-w-0 space-y-5 lg:col-span-3">
          <Panel title={t("about.title")} icon={<UserRound className="h-4 w-4" />} bodyClassName="pt-1">
            {data.bio ? (
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">{data.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{data.isMe ? t("about.emptyMine") : t("about.empty")}</p>
            )}
          </Panel>
          {data.user.email || data.phone ? (
            <Panel title={t("contacts.title")} icon={<Mail className="h-4 w-4" />} bodyClassName="space-y-2 pt-1">
              {data.user.email ? (
                <a href={mailtoHref(data.user.email)} className="flex min-h-10 items-center gap-2 break-all text-sm font-medium text-primary hover:underline">
                  <Mail className="h-4 w-4 shrink-0" /> {data.user.email}
                </a>
              ) : null}
              {data.phone ? (
                <a href={telHref(data.phone)} className="flex min-h-10 items-center gap-2 text-sm font-medium tabular-nums text-primary hover:underline">
                  <Phone className="h-4 w-4 shrink-0" /> {data.phone}
                </a>
              ) : null}
              {data.phone && !data.isMe ? <p className="text-xs text-muted-foreground">{t("contacts.phoneHint")}</p> : null}
            </Panel>
          ) : null}
        </div>
        <div className="min-w-0 lg:col-span-2">
          <PersonCompanies companies={data.companies} isMe={data.isMe} />
        </div>
      </div>
    </div>
  );
}
