"use client";

import { useState } from "react";
import { MapPinPlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { POINT_KINDS, type PointKind } from "@/lib/points/team-points";
import { usePointLabels } from "@/lib/points/labels";
import { btn } from "../ui/primitives";
import { POINT_KIND_CLASS, POINT_KIND_ICON } from "./PointKindIcon";

export interface PointQuotaView {
  limited: boolean;
  remaining: number | null;
  limit: number;
}

/**
 * "Add point" with the kind picker. Desktop: a button in the top toolbar.
 * Phone: a round floating button above the bottom tab bar, menu opening upwards.
 * Clients see how many of their points are left.
 */
export function AddPointControl({
  addKind,
  onStart,
  onCancel,
  variant,
  quota,
}: {
  addKind: PointKind | null;
  onStart: (kind: PointKind) => void;
  onCancel: () => void;
  variant: "toolbar" | "fab";
  quota: PointQuotaView;
}) {
  const t = useTranslations("map");
  const labels = usePointLabels();
  const [menu, setMenu] = useState(false);
  const fab = variant === "fab";
  const ActiveIcon = addKind ? POINT_KIND_ICON[addKind] : MapPinPlus;
  const full = quota.limited && quota.remaining === 0;

  function toggle() {
    if (addKind) onCancel();
    else setMenu((m) => !m);
  }

  return (
    <div className={cn("pointer-events-auto relative", fab ? "absolute bottom-12 right-3 z-20 md:hidden" : "hidden md:block")}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={menu}
        aria-label={addKind ? t("add.cancelAria") : t("add.button")}
        className={cn(
          fab
            ? "flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_28px_-8px_hsl(var(--primary)/0.8)] transition active:scale-95"
            : cn(btn.primary, "h-10"),
          addKind && fab && "bg-slate-900",
        )}
      >
        {addKind ? <X className="h-5 w-5" /> : <ActiveIcon className={fab ? "h-6 w-6" : "h-4 w-4"} />}
        {fab ? null : addKind ? t("add.cancel") : t("add.button")}
      </button>
      {menu && !addKind ? (
        <div
          className={cn(
            "absolute right-0 z-30 w-[min(17rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border bg-popover p-1.5 shadow-elevated",
            fab ? "bottom-16" : "top-12",
          )}
          role="menu"
        >
          {quota.limited ? (
            <p className={cn("mx-1 mb-1 rounded-xl px-2.5 py-2 text-xs font-medium", full ? "bg-bad/10 text-bad" : "bg-primary/10 text-primary")}>
              {full ? t("add.limitReached", { limit: quota.limit }) : t("add.remaining", { remaining: quota.remaining ?? 0, limit: quota.limit })}
            </p>
          ) : null}
          {POINT_KINDS.map((k) => {
            const Icon = POINT_KIND_ICON[k];
            return (
              <button
                key={k}
                type="button"
                role="menuitem"
                disabled={full}
                onClick={() => {
                  setMenu(false);
                  onStart(k);
                }}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-accent disabled:pointer-events-none disabled:opacity-45"
              >
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", POINT_KIND_CLASS[k].tile)}>
                  <Icon className={cn("h-4 w-4", POINT_KIND_CLASS[k].text)} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{labels.kind(k)}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{labels.kindHint(k)}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
