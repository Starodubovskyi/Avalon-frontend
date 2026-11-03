"use client";

import { UserPlus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCompanyActions } from "@/lib/companies/hooks";
import type { CompanyProfile } from "@/lib/companies/types";
import { EmptyState, Panel } from "../ui/primitives";
import { MemberRow } from "./MemberRow";

/** People of the company; the owner and the team also see pending requests and manage positions */
export function CompanyTeam({ profile }: { profile: CompanyProfile }) {
  const t = useTranslations("companies");
  const actions = useCompanyActions(profile.point.id);
  const active = profile.members.filter((m) => m.status === "active");
  const pending = profile.members.filter((m) => m.status === "pending");
  return (
    <Panel
      title={t("team.title")}
      description={profile.canManage ? t("team.manageHint") : t("team.hint")}
      icon={<Users className="h-4 w-4" />}
      bodyClassName="pt-1"
    >
      {profile.canManage && pending.length ? (
        <div className="mb-3 rounded-2xl border border-stage-expected/30 p-1.5">
          <p className="flex items-center gap-1.5 px-2 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-stage-expected">
            <UserPlus className="h-3.5 w-3.5" aria-hidden /> {t("team.requests", { count: pending.length })}
          </p>
          <ul>
            {pending.map((m) => (
              <MemberRow key={m.user.id} member={m} manage actions={actions} />
            ))}
          </ul>
        </div>
      ) : null}
      {active.length ? (
        <ul className="divide-y">
          {active.map((m) => (
            <MemberRow key={m.user.id} member={m} manage={profile.canManage} actions={actions} />
          ))}
        </ul>
      ) : (
        <EmptyState icon={<Users className="h-7 w-7" />} title={t("team.emptyTitle")} text={t("team.emptyText")} />
      )}
    </Panel>
  );
}
