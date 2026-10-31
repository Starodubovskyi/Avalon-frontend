"use client";

import { useState } from "react";
import { MapPinPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { POINT_KINDS, POINT_KIND_HINT, POINT_KIND_LABEL, type PointKind } from "@/lib/points/team-points";
import { btn } from "../ui/primitives";
import { POINT_KIND_CLASS, POINT_KIND_ICON } from "./PointKindIcon";

/**
 * "Add point" with the kind picker. Desktop: a button in the top toolbar.
 * Phone: a round floating button above the bottom tab bar, menu opening upwards.
 */
export function AddPointControl({
  addKind,
  onStart,
  onCancel,
  variant,
}: {
  addKind: PointKind | null;
  onStart: (kind: PointKind) => void;
  onCancel: () => void;
  variant: "toolbar" | "fab";
}) {
  const [menu, setMenu] = useState(false);
  const fab = variant === "fab";
  const ActiveIcon = addKind ? POINT_KIND_ICON[addKind] : MapPinPlus;

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
        aria-label={addKind ? "Cancel adding a point" : "Add point"}
        className={cn(
          fab
            ? "flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_28px_-8px_hsl(var(--primary)/0.8)] transition active:scale-95"
            : cn(btn.primary, "h-10"),
          addKind && fab && "bg-slate-900",
        )}
      >
        {addKind ? <X className="h-5 w-5" /> : <ActiveIcon className={fab ? "h-6 w-6" : "h-4 w-4"} />}
        {fab ? null : addKind ? "Cancel" : "Add point"}
      </button>
      {menu && !addKind ? (
        <div
          className={cn(
            "absolute right-0 z-30 w-64 overflow-hidden rounded-2xl border bg-popover p-1.5 shadow-elevated",
            fab ? "bottom-16" : "top-12",
          )}
          role="menu"
        >
          {POINT_KINDS.map((k) => {
            const Icon = POINT_KIND_ICON[k];
            return (
              <button
                key={k}
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenu(false);
                  onStart(k);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-accent"
              >
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", POINT_KIND_CLASS[k].tile)}>
                  <Icon className={cn("h-4 w-4", POINT_KIND_CLASS[k].text)} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{POINT_KIND_LABEL[k]}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{POINT_KIND_HINT[k]}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
