"use client";

import type { ReactNode } from "react";
import { Building2, Mail, Phone, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtDateTime } from "@/lib/vessels/format";
import { userName } from "@/lib/vessels/types";
import type { AgencyRequest } from "@/lib/requests/types";
import { RequestSummary } from "./RequestBits";
import { RequestActions } from "./RequestActions";

function Contact({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <a
      href={href}
      className="flex min-h-[36px] min-w-0 items-center gap-2 rounded-lg text-sm text-foreground/85 transition hover:text-primary"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">{icon}</span>
      <span className="truncate">{children}</span>
    </a>
  );
}

/** Phone: stacked card. Desktop: one rich row — call, client, actions */
export function RequestCard({ request: r, now, onTouch }: { request: AgencyRequest; now: number; onTouch?: (id: string) => void }) {
  return (
    <li
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-card",
        r.status === "new" && "border-l-4 border-l-stage-expected",
        r.status === "declined" && "opacity-90",
      )}
    >
      <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(300px,340px)]">
        <section className="min-w-0 p-4 sm:p-5">
          <RequestSummary request={r} now={now} sentLabel="Received" />
        </section>

        <section className="min-w-0 border-t p-4 sm:p-5 lg:border-l lg:border-t-0">
          <p className="flex items-center gap-2 font-semibold">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">{r.company}</span>
          </p>
          <div className="mt-2 grid gap-0.5">
            <p className="flex min-h-[36px] items-center gap-2 text-sm text-foreground/85">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <UserRound className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="truncate">{r.contactName}</span>
            </p>
            <Contact href={`mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(`Agency request — ${r.vesselName}`)}`} icon={<Mail className="h-3.5 w-3.5" aria-hidden />}>
              {r.email}
            </Contact>
            {r.phone ? (
              <Contact href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} icon={<Phone className="h-3.5 w-3.5" aria-hidden />}>
                {r.phone}
              </Contact>
            ) : null}
          </div>
          {r.notes ? (
            <p className="mt-3 whitespace-pre-line break-words rounded-xl border bg-background/60 p-3 text-sm text-foreground/85">{r.notes}</p>
          ) : null}
          <p className="mt-3 text-[11px] text-muted-foreground">
            Sent by {userName(r.createdBy)} · {fmtDateTime(r.createdAt)}
          </p>
        </section>

        <section className="border-t bg-muted/30 p-4 sm:p-5 lg:border-l lg:border-t-0">
          <RequestActions request={r} onTouch={onTouch} />
        </section>
      </div>
    </li>
  );
}
