"use client";

import { useEffect, useState } from "react";
import { Anchor, ChevronDown, Layers, Ship, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { STAGE_META } from "@/lib/vessels/status";
import { STAGES } from "@/lib/vessels/types";
import { useStageLabel } from "@/lib/vessels/i18n";
import { POINT_KINDS, type PointKind } from "@/lib/points/team-points";
import { usePointLabels } from "@/lib/points/labels";
import { POINT_KIND_CLASS, POINT_KIND_ICON, PointAvatar } from "./PointKindIcon";
import type { LayerVisibility } from "./FleetMap";

function Chip({
  active,
  onClick,
  children,
  dot,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dot?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={title}
      className={cn(
        "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition",
        active ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {dot ? <span className={cn("h-2 w-2 rounded-full", active ? dot : "bg-muted-foreground/40")} /> : null}
      {children}
    </button>
  );
}

/** Layer toggles floating over the map */
export function MapLayerChips({ layers, onChange }: { layers: LayerVisibility; onChange: (next: LayerVisibility) => void }) {
  const t = useTranslations("map");
  const labels = usePointLabels();
  const toggleKind = (k: PointKind) => onChange({ ...layers, kinds: { ...layers.kinds, [k]: !layers.kinds[k] } });
  return (
    <div className="glass no-scrollbar pointer-events-auto flex min-w-0 max-w-full flex-nowrap items-center gap-0.5 overflow-x-auto rounded-xl border p-1 shadow-card md:flex-wrap md:overflow-visible">
      <Chip active={layers.vessels} onClick={() => onChange({ ...layers, vessels: !layers.vessels })} dot="bg-stage-port">
        <Ship className="h-3.5 w-3.5" /> {t("layers.vessels")}
      </Chip>
      {POINT_KINDS.map((k) => {
        const Icon = POINT_KIND_ICON[k];
        return (
          <Chip key={k} active={layers.kinds[k]} onClick={() => toggleKind(k)} dot={POINT_KIND_CLASS[k].dot} title={labels.kindPlural(k)}>
            <Icon className={cn("h-3.5 w-3.5", layers.kinds[k] && POINT_KIND_CLASS[k].text)} />
            <span className="hidden 2xl:inline">{labels.kindPlural(k)}</span>
            <span className="sr-only 2xl:hidden">{labels.kindPlural(k)}</span>
          </Chip>
        );
      })}
      <Chip active={layers.favoritesOnly} onClick={() => onChange({ ...layers, favoritesOnly: !layers.favoritesOnly })} title={t("layers.favoritesHint")}>
        <Star className={cn("h-3.5 w-3.5", layers.favoritesOnly && "fill-amber-400 text-amber-400")} />
        <span className="hidden lg:inline">{t("layers.favorites")}</span>
        <span className="sr-only lg:hidden">{t("layers.favorites")}</span>
      </Chip>
      <Chip active={layers.seamarks} onClick={() => onChange({ ...layers, seamarks: !layers.seamarks })}>
        <Anchor className="h-3.5 w-3.5" /> {t("layers.seamarks")}
      </Chip>
    </div>
  );
}

export function MapLegend({
  staff,
  showDeparted,
  onShowDeparted,
}: {
  staff: boolean;
  showDeparted: boolean;
  onShowDeparted: (v: boolean) => void;
}) {
  const t = useTranslations("map");
  const labels = usePointLabels();
  const stageLabel = useStageLabel();
  const [open, setOpen] = useState(true);
  // Phones: collapse after mount so the legend does not cover a third of the map
  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) setOpen(false);
  }, []);
  return (
    <div className="glass absolute bottom-8 left-3 z-10 w-[236px] rounded-2xl border p-3 text-xs shadow-elevated md:left-[344px] md:w-[292px]">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-h-6 w-full items-center justify-between font-semibold" aria-expanded={open}>
        <span className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" /> {t("legend.title")}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "" : "-rotate-90")} />
      </button>
      {open ? (
        <>
          <ul className="mt-2.5 space-y-1.5">
            {STAGES.map((s) => (
              <li key={s} className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", STAGE_META[s].dot)} /> {stageLabel(s)}
              </li>
            ))}
            {staff ? (
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-stage-unpaid" /> {t("legend.unpaid")}
              </li>
            ) : null}
          </ul>
          <p className="mt-2 text-muted-foreground">{t("legend.symbols")}</p>
          <ul className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1.5 border-t pt-2.5" aria-label={t("legend.kinds")}>
            {POINT_KINDS.map((k) => (
              <li key={k} className="flex min-w-0 items-center gap-1.5">
                <PointAvatar kind={k} size="xs" />
                <span className="truncate">{labels.kindShort(k)}</span>
              </li>
            ))}
          </ul>
          <label className="mt-2.5 flex cursor-pointer items-center gap-2 border-t pt-2.5 font-medium">
            <input type="checkbox" checked={showDeparted} onChange={(e) => onShowDeparted(e.target.checked)} className="h-3.5 w-3.5 accent-[hsl(var(--primary))]" />
            {t("legend.departed")}
          </label>
        </>
      ) : null}
    </div>
  );
}
