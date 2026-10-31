"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Mail, MapPin, MapPinPlus, MessageCircle, Phone, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtRelative } from "@/lib/vessels/format";
import { userName } from "@/lib/vessels/types";
import {
  POINT_KINDS,
  POINT_KIND_LABEL,
  POINT_KIND_PLURAL,
  pointTitle,
  useTeamPoints,
  type PointKind,
  type TeamPoint,
} from "@/lib/points/team-points";
import { EmptyState, ErrorBlock, LoadingBlock, PageHeader, TextInput, btn } from "../ui/primitives";
import { POINT_KIND_CLASS, PointKindIcon } from "../map/PointKindIcon";

function digits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

function ContactCard({ p }: { p: TeamPoint }) {
  return (
    <li className="group flex flex-col rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex items-start gap-3">
        <PointKindIcon kind={p.kind} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{pointTitle(p)}</p>
          <p className={cn("truncate text-xs font-semibold", POINT_KIND_CLASS[p.kind].text)}>
            {POINT_KIND_LABEL[p.kind]}
            {p.activity ? <span className="font-normal text-muted-foreground"> · {p.activity}</span> : null}
          </p>
        </div>
      </div>
      <div className="mt-3 flex-1 space-y-1.5 text-sm">
        {p.phone ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
              <Phone className="h-3.5 w-3.5" /> {p.phone}
            </a>
            {digits(p.phone).length >= 9 ? (
              <a href={`https://wa.me/${digits(p.phone)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-ok hover:underline">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}
        {p.email ? (
          <a href={`mailto:${p.email}`} className="flex min-w-0 items-center gap-1.5 break-all text-primary hover:underline">
            <Mail className="h-3.5 w-3.5 shrink-0" /> {p.email}
          </a>
        ) : null}
        {p.address ? (
          <p className="flex items-start gap-1.5 text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span className="line-clamp-2">{p.address}</span>
          </p>
        ) : null}
        {!p.phone && !p.email && !p.address ? <p className="text-muted-foreground">No contact details yet</p> : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <span className="truncate text-[11px] text-muted-foreground">
          {userName(p.createdBy)} · {fmtRelative(p.createdAt)}
        </span>
        <Link href={`/maps?point=${p.id}`} className={cn(btn.ghost, "h-8 shrink-0 px-2.5 text-xs")}>
          <MapPin className="h-3.5 w-3.5" /> On map
        </Link>
      </div>
    </li>
  );
}

/** Directory of every typed point the team put on the map (companies, agencies, terminals, people…) */
export function ContactsDirectory() {
  const { data, error, isLoading, mutate } = useTeamPoints();
  const [kind, setKind] = useState<PointKind | "">("");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = {} as Record<PointKind, number>;
    for (const k of POINT_KINDS) c[k] = (data ?? []).filter((p) => p.kind === k).length;
    return c;
  }, [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((p) => !kind || p.kind === kind)
      .filter((p) => !q || `${pointTitle(p)} ${p.activity} ${p.address ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => pointTitle(a).localeCompare(pointTitle(b)));
  }, [data, kind, query]);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Network"
        title="Companies & contacts"
        subtitle="Everyone the team pinned on the fleet map — agencies, terminals, authorities, owners and people."
        actions={
          <Link href={`/maps?add=${kind || "company"}`} className={btn.primary}>
            <MapPinPlus className="h-4 w-4" /> Add on map
          </Link>
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-2 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-wrap" role="tablist" aria-label="Contact type">
          {(["", ...POINT_KINDS] as const).map((k) => {
            const active = kind === k;
            return (
              <button
                key={k || "all"}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setKind(k)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold transition",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {k ? <span className={cn("h-2 w-2 rounded-full", POINT_KIND_CLASS[k].dot)} /> : null}
                {k ? POINT_KIND_PLURAL[k] : "All"}
                <span className={cn("tabular rounded-full px-1.5 text-[10px] font-bold", active ? "bg-white/20" : "bg-muted text-foreground/70")}>
                  {k ? counts[k] : (data ?? []).length}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative p-1 lg:w-72 lg:p-0">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground lg:left-3" />
          <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, address, email" className="pl-9" aria-label="Search contacts" />
        </div>
      </div>

      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {isLoading && !data ? <LoadingBlock label="Loading contacts…" /> : null}
      {data && rows.length === 0 ? (
        <div className="rounded-2xl border bg-card shadow-card">
          <EmptyState
            icon={<MapPinPlus className="h-7 w-7" />}
            title={data.length ? "Nothing matches" : "No contacts yet"}
            text={data.length ? "Try another type or clear the search." : "Open the fleet map, press Add point, choose a type and click on the map."}
            action={
              <Link href="/maps?add=company" className={btn.primary}>
                <MapPinPlus className="h-4 w-4" /> Add the first one
              </Link>
            }
          />
        </div>
      ) : null}
      {rows.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rows.map((p) => (
            <ContactCard key={p.id} p={p} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
