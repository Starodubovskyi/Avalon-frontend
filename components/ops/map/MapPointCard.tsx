"use client";

import { Mail, MapPin, MessageCircle, Pencil, Phone, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtRelative } from "@/lib/vessels/format";
import { userName } from "@/lib/vessels/types";
import { POINT_KIND_LABEL, pointTitle, type TeamPoint } from "@/lib/points/team-points";
import { btn } from "../ui/primitives";
import { POINT_KIND_CLASS, PointKindIcon } from "./PointKindIcon";

export function MapPointCard({
  point,
  onClose,
  onEdit,
  onDelete,
}: {
  point: TeamPoint;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const wa = point.phone ? point.phone.replace(/[^\d]/g, "") : "";
  return (
    <div className="space-y-4 p-5">
      <div className="flex items-start gap-3">
        <PointKindIcon kind={point.kind} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold">{pointTitle(point)}</p>
          <p className={cn("text-xs font-semibold", POINT_KIND_CLASS[point.kind].text)}>
            {POINT_KIND_LABEL[point.kind]}
            {point.activity ? <span className="font-normal text-muted-foreground"> · {point.activity}</span> : null}
          </p>
        </div>
        <button type="button" onClick={onClose} className={btn.icon} aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        {point.phone ? (
          <div className="flex flex-wrap items-center gap-3">
            <a href={`tel:${point.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-medium text-primary hover:underline">
              <Phone className="h-4 w-4" /> {point.phone}
            </a>
            {wa.length >= 9 ? (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-ok hover:underline">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            ) : null}
          </div>
        ) : null}
        {point.email ? (
          <a href={`mailto:${point.email}`} className="flex items-center gap-2 break-all font-medium text-primary hover:underline">
            <Mail className="h-4 w-4 shrink-0" /> {point.email}
          </a>
        ) : null}
        {point.address ? (
          <p className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {point.address}
          </p>
        ) : null}
        {!point.phone && !point.email && !point.address ? <p className="text-muted-foreground">No contact details yet.</p> : null}
        {point.notes ? <p className="whitespace-pre-wrap rounded-xl bg-muted/70 p-3 text-[13px]">{point.notes}</p> : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Added by {userName(point.createdBy)} · {fmtRelative(point.createdAt)}
      </p>

      <div className="flex gap-2">
        <button type="button" onClick={onEdit} className={cn(btn.secondary, "h-9 flex-1")}>
          <Pencil className="h-4 w-4" /> Edit
        </button>
        <button type="button" onClick={onDelete} className={cn(btn.secondary, "h-9 w-9 px-0 hover:text-bad")} aria-label="Delete point">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
