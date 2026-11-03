"use client";

import { CircleCheck, CircleX, TriangleAlert, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PortStatus } from "@/lib/api/ports";
import { cn } from "@/lib/utils";

/** `label` is the English fallback; screens show usePortStatusLabel() */
export const PORT_STATUS_META: Record<PortStatus, { label: string; icon: LucideIcon; chip: string; dot: string }> = {
  Open: { label: "Open", icon: CircleCheck, chip: "border-ok/25 bg-ok/10 text-ok", dot: "bg-ok" },
  Congested: {
    label: "Congested",
    icon: TriangleAlert,
    chip: "border-stage-expected/30 bg-stage-expected/10 text-stage-expected",
    dot: "bg-stage-expected",
  },
  Closed: { label: "Closed", icon: CircleX, chip: "border-bad/25 bg-bad/10 text-bad", dot: "bg-bad" },
};

/** Open / Congested / Closed in the interface language (ports.status.*) */
export function usePortStatusLabel() {
  const t = useTranslations("ports.status");
  return (status: PortStatus) => t(status);
}

export function PortStatusBadge({ status, className }: { status: PortStatus; className?: string }) {
  const statusLabel = usePortStatusLabel();
  const meta = PORT_STATUS_META[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        meta.chip,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {statusLabel(status)}
    </span>
  );
}
