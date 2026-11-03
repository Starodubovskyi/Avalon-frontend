"use client";

import type { ReactNode } from "react";
import { Ship, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { btn } from "../ui/primitives";

export type MapTab = "vessels" | "contacts";

/** Floating list panel of the fleet map: vessels and points in two tabs (slides in on phones) */
export function MapSidebar({
  open,
  onClose,
  tab,
  onTab,
  inWork,
  vesselCount,
  pointCount,
  vessels,
  points,
}: {
  open: boolean;
  onClose: () => void;
  tab: MapTab;
  onTab: (tab: MapTab) => void;
  inWork: number;
  vesselCount: number;
  pointCount: number;
  vessels: ReactNode;
  points: ReactNode;
}) {
  const t = useTranslations("map");
  return (
    <aside
      className={cn(
        "glass absolute inset-y-3 left-3 z-20 flex w-[320px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border shadow-elevated transition-[transform,visibility] md:visible md:translate-x-0",
        open ? "visible translate-x-0" : "invisible -translate-x-[110%]",
      )}
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <div>
          <p className="font-display text-[15px] font-bold">{t("sidebar.title")}</p>
          <p className="text-xs text-muted-foreground">{t("sidebar.summary", { vessels: inWork, points: pointCount })}</p>
        </div>
        <button type="button" onClick={onClose} className={cn(btn.icon, "h-10 w-10 md:hidden")} aria-label={t("sidebar.close")}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mx-3 grid grid-cols-2 rounded-xl bg-muted p-1 text-xs font-semibold" role="tablist">
        {(["vessels", "contacts"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => onTab(id)}
            className={cn(
              "flex min-h-9 items-center justify-center gap-1.5 rounded-lg py-2 transition",
              tab === id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {id === "vessels" ? <Ship className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
            {id === "vessels" ? t("sidebar.vesselsTab", { count: vesselCount }) : t("sidebar.pointsTab", { count: pointCount })}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">{tab === "vessels" ? vessels : points}</div>
    </aside>
  );
}
