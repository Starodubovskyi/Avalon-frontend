"use client";

import { useState } from "react";
import { Check, Inbox, X } from "lucide-react";
import { toast } from "sonner";
import { useFormatter, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useApiErrorText } from "@/lib/api/fieldErrors";
import { personName } from "@/lib/network/format";
import { WALLET_ERRORS } from "@/lib/wallet/api";
import { useTopUpRequests, useWalletActions } from "@/lib/wallet/hooks";
import type { TopUpRequest, TopUpStatus } from "@/lib/wallet/types";
import { Avatar, EmptyState, ErrorBlock, LoadingBlock, Spinner, btn } from "../ui/primitives";

const STATUSES: TopUpStatus[] = ["pending", "approved", "declined"];

const STATUS_PILL: Record<TopUpStatus, string> = {
  pending: "bg-stage-expected/15 text-stage-expected",
  approved: "bg-ok/10 text-ok",
  declined: "bg-muted text-muted-foreground",
};

function RequestRow({ request }: { request: TopUpRequest }) {
  const t = useTranslations("balance");
  const format = useFormatter();
  const errorText = useApiErrorText("balance", WALLET_ERRORS);
  const { handleTopUp } = useWalletActions();
  const [busy, setBusy] = useState<"approve" | "decline" | null>(null);
  const name = personName(request.user);

  async function act(approve: boolean) {
    setBusy(approve ? "approve" : "decline");
    try {
      await handleTopUp(request.id, approve);
      toast.success(approve ? t("admin.approved", { amount: format.number(request.amount), name }) : t("admin.declined", { name }));
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap">
      <Avatar name={name} className="h-10 w-10" />
      <div className="min-w-0 flex-1 basis-44">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {format.dateTime(new Date(request.createdAt), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          {request.note ? ` · ${request.note}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="tabular font-display text-lg font-bold">+{format.number(request.amount)}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", STATUS_PILL[request.status])}>{t(`admin.status.${request.status}`)}</span>
      </div>
      {request.status === "pending" ? (
        <div className="ml-auto flex shrink-0 gap-1.5">
          <button type="button" onClick={() => void act(false)} disabled={busy !== null} className={cn(btn.secondary, "h-10 px-3")}>
            {busy === "decline" ? <Spinner className="h-4 w-4" /> : <X className="h-4 w-4" />} {t("admin.decline")}
          </button>
          <button type="button" onClick={() => void act(true)} disabled={busy !== null} className={cn(btn.primary, "h-10 px-3")}>
            {busy === "approve" ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <Check className="h-4 w-4" />} {t("admin.approve")}
          </button>
        </div>
      ) : request.handledAt ? (
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
          {format.dateTime(new Date(request.handledAt), { day: "numeric", month: "short" })}
        </span>
      ) : null}
    </li>
  );
}

/** Admin: requests by status, newest first; approving credits the balance */
export function TopUpRequestsPanel() {
  const t = useTranslations("balance");
  const [status, setStatus] = useState<TopUpStatus>("pending");
  const { data, error, isLoading, mutate } = useTopUpRequests(status);
  return (
    <section className="rounded-2xl border bg-card shadow-card">
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b p-2" role="tablist" aria-label={t("admin.statusFilter")}>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={cn(
              "min-h-10 shrink-0 rounded-xl px-3.5 text-[13px] font-semibold transition",
              status === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {t(`admin.status.${s}`)}
          </button>
        ))}
      </div>
      <div className="px-4 sm:px-5">
        {error && !data ? (
          <div className="py-4">
            <ErrorBlock error={new Error(t("loadError"))} onRetry={() => void mutate()} />
          </div>
        ) : null}
        {isLoading && !data ? <LoadingBlock label={t("loading")} /> : null}
        {data && !data.length ? <EmptyState icon={<Inbox className="h-7 w-7" />} title={t(`admin.empty.${status}`)} text={t("admin.emptyText")} /> : null}
        {data?.length ? (
          <ul className="divide-y">
            {data.map((r) => (
              <RequestRow key={r.id} request={r} />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
