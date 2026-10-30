"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Mail, MessageCircle, Phone, X } from "lucide-react";
import { daysSince, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { marineTrafficUrl } from "@/lib/vessels/geo";
import { fmtDateTime } from "@/lib/vessels/format";
import { DESTINATION_LABEL, TYPE_LABEL, type VesselView } from "@/lib/vessels/types";
import { StageBadge, UnpaidBadge } from "../ui/StageBadge";
import { ChecklistRow } from "../vessels/ChecklistRow";

function QuickContact({
  role,
  name,
  phone,
  email,
}: {
  role: string;
  name: string | null;
  phone: string | null;
  email: string | null;
}) {
  const wa = phone ? phone.replace(/[^\d]/g, "") : "";
  return (
    <div className="min-w-0 text-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {role}
        {name ? <span className="ml-1.5 normal-case tracking-normal text-foreground">{name}</span> : null}
      </p>
      {!phone && !email ? <p className="text-xs text-muted-foreground">No contacts yet</p> : null}
      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        {phone ? (
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
            <Phone className="h-3.5 w-3.5" /> {phone}
          </a>
        ) : null}
        {wa.length >= 9 ? (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-ok hover:underline">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        ) : null}
        {email ? (
          <a href={`mailto:${email}`} className="inline-flex min-w-0 items-center gap-1.5 break-all text-primary hover:underline">
            <Mail className="h-3.5 w-3.5 shrink-0" /> {email}
          </a>
        ) : null}
      </div>
    </div>
  );
}

export function MapVesselCard({
  vessel,
  editable,
  onClose,
}: {
  vessel: VesselView;
  editable: boolean;
  onClose: () => void;
}) {
  const unpaid = isUnpaidAfterDeparture(vessel);
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{vessel.name}</p>
          <p className="text-xs text-muted-foreground">
            {vessel.imo ? `IMO ${vessel.imo}` : "IMO —"} · {TYPE_LABEL[vessel.type]} → {DESTINATION_LABEL[vessel.destination]}
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <StageBadge stage={vessel.stage} />
        {unpaid ? <UnpaidBadge days={daysSince(vessel.departedAt)} /> : null}
      </div>

      <dl className="tabular grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div><dt className="text-muted-foreground">ETA Sulina</dt><dd>{fmtDateTime(vessel.etaSulina)}</dd></div>
        <div><dt className="text-muted-foreground">Arrival</dt><dd>{fmtDateTime(vessel.arrivedAt)}</dd></div>
        <div><dt className="text-muted-foreground">In port</dt><dd>{fmtDateTime(vessel.inPortAt)}</dd></div>
        <div><dt className="text-muted-foreground">Departure</dt><dd>{fmtDateTime(vessel.departedAt)}</dd></div>
      </dl>

      {!vessel.restricted ? (
        <>
          <ChecklistRow vessel={vessel} editable={editable} wrap />
          <div className="space-y-2.5">
            <QuickContact role="Master" name={vessel.masterName} phone={vessel.masterPhone} email={vessel.masterEmail} />
            <QuickContact role="Office" name={vessel.officeName} phone={vessel.officePhone} email={vessel.officeEmail} />
          </div>
        </>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link href={`/vessels/${vessel.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:brightness-110">
          Open card <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <a href={marineTrafficUrl(vessel)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium hover:bg-accent">
          <ExternalLink className="h-3.5 w-3.5" /> MarineTraffic
        </a>
      </div>
    </div>
  );
}
