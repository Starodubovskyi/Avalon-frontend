"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeftRight, MessageCircle, UserCheck, UserMinus, UserPlus, UserRoundCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from "@/lib/network/api";
import { personName } from "@/lib/network/format";
import { Avatar, btn } from "../ui/primitives";
import { PersonRoleBadge } from "../network/bits";

function Relation({ person }: { person: Person }) {
  if (person.followedByMe && person.followsMe) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-ok/25 bg-ok/10 px-2 py-0 text-[11px] font-semibold text-ok">
        <ArrowLeftRight className="h-3 w-3" aria-hidden /> Friends
      </span>
    );
  }
  if (person.followedByMe) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2 py-0 text-[11px] font-semibold text-primary">
        <UserCheck className="h-3 w-3" aria-hidden /> Following
      </span>
    );
  }
  if (person.followsMe) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0 text-[11px] font-semibold text-muted-foreground">
        <UserRoundCheck className="h-3 w-3" aria-hidden /> Follows you
      </span>
    );
  }
  return null;
}

export function PersonCard({ person, onToggleFollow }: { person: Person; onToggleFollow: (p: Person) => Promise<void> }) {
  const name = personName(person);
  const busy = useRef(false);
  const stats: [string, number][] = [
    ["Followers", person.followers],
    ["Following", person.following],
    ["Posts", person.posts],
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
        <Avatar name={name} className="h-12 w-12 text-base" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[15px] font-bold leading-snug">{name}</h3>
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
            <dd className="tabular font-display text-lg font-bold leading-tight">{value.toLocaleString("en-GB")}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-2 pt-0.5">
        <button
          type="button"
          onClick={() => void toggle()}
          aria-pressed={person.followedByMe}
          aria-label={person.followedByMe ? `Unfollow ${name}` : `Follow ${name}`}
          className={cn(person.followedByMe ? btn.secondary : btn.primary, "h-9 px-3")}
        >
          {person.followedByMe ? <UserMinus className="h-4 w-4" aria-hidden /> : <UserPlus className="h-4 w-4" aria-hidden />}
          {person.followedByMe ? "Unfollow" : person.followsMe ? "Follow back" : "Follow"}
        </button>
        <Link href={`/chat?with=${person.id}`} className={cn(btn.secondary, "h-9 px-3")} aria-label={`Message ${name}`}>
          <MessageCircle className="h-4 w-4" aria-hidden /> Message
        </Link>
      </div>
    </article>
  );
}
