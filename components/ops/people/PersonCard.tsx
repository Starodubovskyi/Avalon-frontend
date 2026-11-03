"use client";

import { useRef } from "react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowLeftRight, MessageCircle, UserCheck, UserMinus, UserPlus, UserRoundCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from "@/lib/network/api";
import { personName } from "@/lib/network/format";
import { Avatar, btn } from "../ui/primitives";
import { PersonRoleBadge } from "../network/bits";

function Relation({ person }: { person: Person }) {
  const t = useTranslations("people.relation");
  if (person.followedByMe && person.followsMe) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-ok/25 bg-ok/10 px-2 py-0 text-[11px] font-semibold text-ok">
        <ArrowLeftRight className="h-3 w-3" aria-hidden /> {t("friends")}
      </span>
    );
  }
  if (person.followedByMe) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0 text-[11px] font-semibold text-primary">
        <UserCheck className="h-3 w-3" aria-hidden /> {t("following")}
      </span>
    );
  }
  if (person.followsMe) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0 text-[11px] font-semibold text-muted-foreground">
        <UserRoundCheck className="h-3 w-3" aria-hidden /> {t("followsYou")}
      </span>
    );
  }
  return null;
}

export function PersonCard({ person, onToggleFollow }: { person: Person; onToggleFollow: (p: Person) => Promise<void> }) {
  const t = useTranslations("people.card");
  const format = useFormatter();
  const name = personName(person);
  const busy = useRef(false);
  const stats: [string, number][] = [
    [t("followers"), person.followers],
    [t("following"), person.following],
    [t("posts"), person.posts],
  ];

  async function toggle() {
    if (busy.current) return;
    busy.current = true;
    await onToggleFollow(person);
    busy.current = false;
  }

  return (
    <article className="flex h-full flex-col rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start gap-3.5">
        <Link href={`/people/${person.id}`} tabIndex={-1} aria-hidden className="shrink-0 rounded-full">
          <Avatar name={name} className="h-12 w-12 text-base" />
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-bold leading-snug">
            <Link href={`/people/${person.id}`} className="hover:text-primary hover:underline focus-visible:underline focus-visible:outline-none">
              {name}
            </Link>
          </h3>
          {person.email ? <p className="truncate text-xs text-muted-foreground">{person.email}</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <PersonRoleBadge role={person.role} compact />
            <Relation person={person} />
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 divide-x rounded-xl border bg-muted/30 py-2.5 text-center">
        {stats.map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse px-1">
            <dt className="text-[11px] text-muted-foreground">{label}</dt>
            <dd className="tabular font-display text-lg font-bold leading-tight">{format.number(value)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => void toggle()}
          aria-pressed={person.followedByMe}
          aria-label={person.followedByMe ? t("unfollowAria", { name }) : t("followAria", { name })}
          className={cn(person.followedByMe ? btn.secondary : btn.primary, "h-auto min-h-9 px-3 py-1.5")}
        >
          {person.followedByMe ? <UserMinus className="h-4 w-4 shrink-0" aria-hidden /> : <UserPlus className="h-4 w-4 shrink-0" aria-hidden />}
          <span className="text-center leading-tight">{person.followedByMe ? t("unfollow") : person.followsMe ? t("followBack") : t("follow")}</span>
        </button>
        <Link href={`/chat?with=${person.id}`} className={cn(btn.secondary, "h-auto min-h-9 px-3 py-1.5")} aria-label={t("messageAria", { name })}>
          <MessageCircle className="h-4 w-4 shrink-0" aria-hidden /> <span className="truncate">{t("message")}</span>
        </Link>
      </div>
    </article>
  );
}
