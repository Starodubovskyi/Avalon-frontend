"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Check, Crown, Pencil, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { personName } from "@/lib/network/format";
import { POSITION_MAX, type CompanyMember } from "@/lib/companies/types";
import { Avatar, Spinner, TextInput, btn } from "../ui/primitives";
import { RankBadge } from "../map/RankBadge";

export interface MemberActions {
  approve: (m: CompanyMember) => Promise<void>;
  setPosition: (m: CompanyMember, position: string | null) => Promise<boolean>;
  remove: (m: CompanyMember) => Promise<void>;
}

/** One person of the company: avatar, name (→ personal page), position, headline, RANK; manage controls */
export function MemberRow({ member, manage, actions }: { member: CompanyMember; manage: boolean; actions: MemberActions }) {
  const t = useTranslations("companies");
  const name = personName(member.user);
  const [editing, setEditing] = useState(false);
  const [position, setPosition] = useState(member.position ?? "");
  const [busy, setBusy] = useState(false);
  const pending = member.status === "pending";
  const canChange = manage && member.role !== "owner";

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    await fn();
    setBusy(false);
  }

  async function savePosition(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await actions.setPosition(member, position.trim() || null);
    setBusy(false);
    if (ok) setEditing(false);
  }

  const nameNode = pending ? (
    <span className="truncate font-semibold">{name}</span>
  ) : (
    <Link href={`/people/${member.user.id}`} className="truncate font-semibold hover:text-primary hover:underline">
      {name}
    </Link>
  );

  return (
    <li className={cn("flex flex-wrap items-center gap-3 rounded-xl px-2 py-2.5 sm:flex-nowrap", pending && "bg-stage-expected/[0.06]")}>
      <Avatar name={name} className="h-11 w-11 text-sm" />
      <div className="min-w-0 flex-1 basis-40">
        <div className="flex min-w-0 items-center gap-1.5">
          {nameNode}
          {member.role === "owner" ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              <Crown className="h-3 w-3" aria-hidden /> {t("team.owner")}
            </span>
          ) : null}
          {pending ? (
            <span className="shrink-0 rounded-full bg-stage-expected/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stage-expected">{t("team.pending")}</span>
          ) : null}
        </div>
        {editing ? (
          <form onSubmit={savePosition} className="mt-1.5 flex items-center gap-1.5">
            <TextInput value={position} onChange={(e) => setPosition(e.target.value)} maxLength={POSITION_MAX} placeholder={t("membership.positionPlaceholder")} className="h-10" autoFocus aria-label={t("membership.position")} />
            <button type="submit" disabled={busy} className={cn(btn.primary, "h-10 w-10 shrink-0 px-0")} aria-label={t("team.savePosition")}>
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <Check className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => setEditing(false)} className={cn(btn.icon, "h-10 w-10 shrink-0")} aria-label={t("membership.close")}>
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <p className="truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{member.role === "owner" ? t("team.ownerRole") : member.position || t("team.noPosition")}</span>
            {member.headline ? ` · ${member.headline}` : ""}
          </p>
        )}
      </div>
      {!editing ? <RankBadge rank={member.rank} size="sm" label={false} title={t("team.rankHint")} /> : null}
      {canChange && !editing ? (
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {pending ? (
            <>
              <button type="button" disabled={busy} onClick={() => void act(() => actions.approve(member))} className={cn(btn.primary, "h-10 px-3 text-xs")}>
                <Check className="h-4 w-4" /> {t("team.approve")}
              </button>
              <button type="button" disabled={busy} onClick={() => void act(() => actions.remove(member))} className={cn(btn.secondary, "h-10 px-3 text-xs")}>
                {t("team.decline")}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setEditing(true)} className={cn(btn.icon, "h-10 w-10")} aria-label={t("team.editPosition", { name })}>
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => window.confirm(t("team.removeConfirm", { name })) && void act(() => actions.remove(member))}
                className={cn(btn.icon, "h-10 w-10 hover:text-bad")}
                aria-label={t("team.remove", { name })}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ) : null}
    </li>
  );
}
