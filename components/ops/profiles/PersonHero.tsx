"use client";

import Link from "next/link";
import { CalendarDays, MessageCircle, Pencil, UserCheck, UserPlus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { personName } from "@/lib/network/format";
import { useProfileFollow } from "@/lib/profiles/hooks";
import type { PersonProfile } from "@/lib/profiles/types";
import { Avatar, btn } from "../ui/primitives";
import { PersonRoleBadge } from "../network/bits";
import { RankBadge } from "../map/RankBadge";

/** Cover, initials avatar, name, headline, role, RANK and Follow / Message / Edit profile */
export function PersonHero({ profile }: { profile: PersonProfile }) {
  const t = useTranslations("profiles");
  const format = useFormatter();
  const follow = useProfileFollow();
  const name = personName(profile.user);
  return (
    <section className="overflow-hidden rounded-3xl border bg-card shadow-card">
      <div className="brand-surface relative h-28 overflow-hidden sm:h-36">
        <div className="brand-aurora" aria-hidden />
        <div className="brand-grid" aria-hidden />
      </div>
      <div className="px-4 pb-5 sm:px-6">
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-3">
          {/* solid plate under the tinted initials so the cover does not show through */}
          <span className="relative z-10 inline-flex rounded-full bg-card shadow-elevated ring-4 ring-card">
            <Avatar name={name} className="h-24 w-24 text-3xl" />
          </span>
          <div className="flex flex-wrap gap-2">
            {profile.isMe ? (
              <Link href="/account" className={cn(btn.secondary, "h-10")}>
                <Pencil className="h-4 w-4" /> {t("hero.edit")}
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void follow(profile)}
                  aria-pressed={profile.isFollowing}
                  className={cn(profile.isFollowing ? btn.secondary : btn.primary, "h-10")}
                >
                  {profile.isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {profile.isFollowing ? t("hero.following") : t("hero.follow")}
                </button>
                {profile.canMessage ? (
                  <Link href={`/chat?with=${profile.user.id}`} className={cn(btn.secondary, "h-10")}>
                    <MessageCircle className="h-4 w-4" /> {t("hero.message")}
                  </Link>
                ) : null}
              </>
            )}
          </div>
        </div>
        <div className="mt-4 min-w-0">
          <h1 className="break-words font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{name}</h1>
          {profile.headline ? <p className="mt-1 text-[15px] font-medium text-foreground/80">{profile.headline}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <PersonRoleBadge role={profile.user.role} compact />
            <RankBadge rank={profile.rank} title={t("hero.rankHint")} />
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {t("hero.memberSince", { date: format.dateTime(new Date(profile.memberSince), { month: "long", year: "numeric" }) })}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
