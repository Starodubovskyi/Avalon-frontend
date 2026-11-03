"use client";

import { useTranslations } from "next-intl";
import { CheckPill } from "../ui/CheckPill";
import { isItemDone } from "@/lib/vessels/status";
import { useVesselLabels } from "@/lib/vessels/i18n";
import type { VesselView } from "@/lib/vessels/types";
import { useChecklistToggle } from "./useChecklistToggle";

export function ChecklistRow({
  vessel,
  editable,
  size = "sm",
  wrap = false,
}: {
  vessel: VesselView;
  editable: boolean;
  size?: "sm" | "md";
  wrap?: boolean;
}) {
  const t = useTranslations("vessels.checklistState");
  const labels = useVesselLabels();
  const { toggle, isBusy, items } = useChecklistToggle();
  return (
    <div className={wrap ? "flex flex-wrap gap-1.5" : "flex gap-1"}>
      {items.map((item) => (
        <CheckPill
          key={item.key}
          label={size === "md" ? item.label : item.short}
          hint={item.key === "t1" && vessel.t1 ? t("t1Now", { hint: item.hint, value: labels.t1(vessel.t1) }) : item.hint}
          done={isItemDone(vessel, item.key)}
          size={size}
          editable={editable && !vessel.restricted}
          busy={isBusy(vessel, item.key)}
          onToggle={() => void toggle(vessel, item.key)}
        />
      ))}
    </div>
  );
}
