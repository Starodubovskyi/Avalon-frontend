"use client";

import { Briefcase, MapPin, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtRelative } from "@/lib/vessels/format";
import { userName } from "@/lib/vessels/types";
import { activityLine } from "@/lib/points/activities";
import { POINT_KIND_LABEL, pointTitle, type TeamPoint } from "@/lib/points/team-points";
import { btn } from "../ui/primitives";
import { POINT_KIND_CLASS, PointLogoAvatar } from "./PointKindIcon";
import { PointActions } from "./PointActions";
import { RankBadge } from "./RankBadge";

export function MapPointCard({
  point,
  editable = true,
  onClose,
  onEdit,
  onDelete,
}: {
  point: TeamPoint;
  editable?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const activity = activityLine(point);
  return (
    <div>
      <div className={cn("relative h-24 overflow-hidden md:rounded-t-2xl", POINT_KIND_CLASS[point.kind].gradient)}>
        <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/15 blur-2xl" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" aria-hidden />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur transition hover:bg-black/35"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 px-5 pb-5">
        <div className="-mt-9">
          <PointLogoAvatar point={point} size="lg" className="ring-4 ring-card" />
        </div>

        <div className="min-w-0">
          <p className="break-words font-display text-xl font-bold leading-tight">{pointTitle(point)}</p>
          <p className={cn("mt-1 text-[11px] font-bold uppercase tracking-[0.12em]", POINT_KIND_CLASS[point.kind].text)}>{POINT_KIND_LABEL[point.kind]}</p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-muted/50 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Briefcase className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Business Activity</span>
            <span className={cn("block truncate text-sm font-semibold", !activity && "font-normal text-muted-foreground")}>{activity || "Not set"}</span>
          </span>
        </div>
        {/* client's order: Business Activity, then Rank right below it */}
        <RankBadge rank={point.rank} />

        <PointActions point={point} />

        <div className="space-y-2 border-t pt-3 text-sm">
          {point.phone || point.email ? (
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
              {point.phone ? <span className="font-medium tabular-nums">{point.phone}</span> : null}
              {point.email ? <span className="break-all text-muted-foreground">{point.email}</span> : null}
            </p>
          ) : null}
          {point.address ? (
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {point.address}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Added by <span className="font-medium text-foreground/80">{userName(point.createdBy)}</span> · {fmtRelative(point.createdAt)}
          </p>
        </div>

        {editable ? (
          <div className="flex gap-2">
            <button type="button" onClick={onEdit} className={cn(btn.secondary, "h-10 flex-1")}>
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button type="button" onClick={onDelete} className={cn(btn.secondary, "h-10 w-10 px-0 hover:text-bad")} aria-label="Delete point">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
