"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { httpStatus } from "@/lib/api/fieldErrors";
import { useCompany } from "@/lib/companies/hooks";
import { EmptyState, ErrorBlock, btn } from "../ui/primitives";
import { PointFormDialog } from "../map/PointFormDialog";
import { CompanyHero } from "./CompanyHero";
import { CompanyAbout } from "./CompanyAbout";
import { CompanyMiniMap } from "./CompanyMiniMap";
import { CompanyRelations } from "./CompanyRelations";
import { CompanyTeam } from "./CompanyTeam";

function Skeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
        <div className="h-32 animate-pulse bg-muted sm:h-40" />
        <div className="space-y-3 px-6 pb-6">
          <div className="-mt-12 h-24 w-24 animate-pulse rounded-3xl bg-muted ring-4 ring-card" />
          <div className="h-7 w-2/3 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-2xl bg-muted lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

/** /companies/[id]: the company profile of a map point */
export function CompanyProfileView({ id }: { id: string }) {
  const t = useTranslations("companies");
  const { data, error, isLoading, mutate } = useCompany(id);
  const [editing, setEditing] = useState(false);

  if (error && !data) {
    // 400: not a point id at all (ParseUUIDPipe); 404: deleted or not visible to me
    if (httpStatus(error) === 404 || httpStatus(error) === 400) {
      return (
        <div className="rounded-3xl border bg-card shadow-card">
          <EmptyState
            icon={<Building2 className="h-7 w-7" />}
            title={t("profile.notFoundTitle")}
            text={t("profile.notFoundText")}
            action={
              <Link href="/companies" className={btn.primary}>
                <ArrowLeft className="h-4 w-4" /> {t("profile.back")}
              </Link>
            }
          />
        </div>
      );
    }
    return <ErrorBlock error={new Error(t("profile.loadError"))} onRetry={() => void mutate()} />;
  }
  if (isLoading || !data) return <Skeleton />;

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <CompanyHero profile={data} onEdit={() => setEditing(true)} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="min-w-0 space-y-5 lg:col-span-2">
          <CompanyAbout point={data.point} />
          <CompanyTeam profile={data} />
        </div>
        <div className="min-w-0 space-y-5">
          <CompanyMiniMap point={data.point} />
          <CompanyRelations profile={data} />
        </div>
      </div>
      {data.point.canEdit ? (
        <PointFormDialog open={editing} onOpenChange={setEditing} point={data.point} defaultKind={data.point.kind} onSaved={() => void mutate()} />
      ) : null}
    </div>
  );
}
