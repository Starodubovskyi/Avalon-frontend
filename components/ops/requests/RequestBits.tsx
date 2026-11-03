"use client";

import { useTranslations } from "next-intl";
import { MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";
import { REQUEST_STATUS_META, type AgencyRequest, type RequestStatus } from "@/lib/requests/types";
import { DESTINATION_LABEL, type VesselType } from "@/lib/vessels/types";
import { TYPE_ICON } from "../vessels/VesselTypeIcon";
import { useTimeFormat } from "../network/useTimeFormat";

export function RequestStatusBadge({ status, className }: { status: RequestStatus; className?: string }) {
  const t = useTranslations("requests.status");
  const meta = REQUEST_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-current/15 px-2.5 py-1 text-[11px] font-semibold",
        meta.soft,
        meta.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot, status === "new" && "animate-pulse")} aria-hidden />
      {t(status)}
    </span>
  );
}

/** Vessel-type tile tinted by the request status (requests have no voyage stage yet) */
export function RequestTypeIcon({ type, status }: { type: VesselType; status: RequestStatus }) {
  const t = useTranslations("requests.vesselType");
  const Icon = TYPE_ICON[type];
  const meta = REQUEST_STATUS_META[status];
  return (
    <span title={t(type)} className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", meta.soft, meta.text)}>
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}

/** Vessel, status and call facts — the same head on the client's list and the staff inbox */
export function RequestSummary({ request: r, now, sentLabel }: { request: AgencyRequest; now: number; sentLabel: string }) {
  const t = useTranslations("requests");
  const time = useTimeFormat();
  return (
    <>
      <div className="flex items-start gap-3">
        <RequestTypeIcon type={r.vesselType} status={r.status} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <p className="min-w-0 truncate font-semibold">{r.vesselName}</p>
            <RequestStatusBadge status={r.status} />
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {r.imo ? `IMO ${r.imo}` : t("summary.noImo")} · {t(`vesselType.${r.vesselType}`)} → {DESTINATION_LABEL[r.destination]}
          </p>
        </div>
      </div>
      <dl className="tabular mt-3 grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-2.5 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">{t("summary.eta")}</dt>
          <dd className="font-semibold">{time.dateTime(r.eta)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{sentLabel}</dt>
          <dd className="font-semibold" title={time.dateTime(r.createdAt)}>
            {time.relative(r.createdAt, now)}
          </dd>
        </div>
        <div className="col-span-2 min-w-0 sm:col-span-1">
          <dt className="text-muted-foreground">{t("summary.cargo")}</dt>
          <dd className="truncate font-semibold">{r.cargo ?? "—"}</dd>
        </div>
      </dl>
    </>
  );
}

/** The agent's reply as the client sees it */
export function AgentNote({ note, className }: { note: string; className?: string }) {
  const t = useTranslations("requests");
  return (
    <div className={cn("flex gap-2.5 rounded-xl border border-primary/15 bg-primary/[0.05] p-3", className)}>
      <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">{t("agentNote")}</p>
        <p className="mt-0.5 whitespace-pre-line break-words text-sm text-foreground/90">{note}</p>
      </div>
    </div>
  );
}
