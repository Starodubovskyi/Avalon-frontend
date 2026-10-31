"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, Calculator, CheckCircle2, ClipboardList, Inbox, MessageSquareQuote, Plus, Ship } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import { useAgencyRequests } from "@/lib/requests/hooks";
import { initialRequestForm } from "@/lib/requests/form";
import type { AgencyRequest } from "@/lib/requests/types";
import { DESTINATION_LABEL } from "@/lib/vessels/types";
import { PageHeader, Panel, btn } from "../ui/primitives";
import { RequestForm } from "./RequestForm";
import { MyRequests } from "./MyRequests";
import { RequestStatusBadge } from "./RequestBits";

const NEXT_STEPS = [
  { icon: Inbox, title: "We review", text: "An Avalon agent checks the vessel, ETA and berth availability." },
  { icon: MessageSquareQuote, title: "You get terms", text: "The status turns Quoted and the agent's note appears below." },
  { icon: Ship, title: "On the board", text: "Once accepted, the vessel is added to the live board you can follow." },
];

function SentCard({ saved, onAnother }: { saved: AgencyRequest; onAnother: () => void }) {
  return (
    <div className="flex flex-col items-center px-2 py-8 text-center sm:py-10">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ok/10 text-ok ring-8 ring-ok/5">
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </span>
      <h2 className="mt-5 font-display text-2xl font-bold">Request sent</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        {saved.vesselName} → {DESTINATION_LABEL[saved.destination]}. An agent will reply here — the status changes as we work on it.
      </p>
      <RequestStatusBadge status={saved.status} className="mt-4" />
      <div className="mt-7 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <a href="#your-requests" className={cn(btn.secondary, "h-11")}>
          <ArrowDown className="h-4 w-4" aria-hidden /> See it in your requests
        </a>
        <button type="button" onClick={onAnother} className={cn(btn.primary, "h-11")}>
          <Plus className="h-4 w-4" aria-hidden /> Send another request
        </button>
      </div>
    </div>
  );
}

export function RequestView() {
  const params = useSearchParams();
  const { user } = useAuth();
  const staff = canEdit(user);
  const { data, error, isLoading, mutate } = useAgencyRequests();
  const [sent, setSent] = useState<AgencyRequest | null>(null);
  const [round, setRound] = useState(0);

  const fromEstimate = !!(params?.get("estimate") || params?.get("gt"));
  // Prefill on mount from the query (estimator, port guide) and the profile; later rounds from the profile only
  const [initial, setInitial] = useState(() => initialRequestForm(params, user));

  // Staff see every client's request in /requests; here only the ones they sent themselves
  const mine = useMemo(
    () => (staff ? data?.filter((r) => r.createdBy !== null && String(r.createdBy.id) === String(user?.id)) : data),
    [data, staff, user?.id],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Clients"
        title="Request agency"
        subtitle="Nominate Avalon for your next Danube call. The agent's reply and every status change appear under Your requests."
        actions={
          staff ? (
            <Link href="/requests" className={btn.secondary}>
              <ClipboardList className="h-4 w-4" aria-hidden /> All requests
            </Link>
          ) : (
            <Link href="/estimate" className={btn.secondary}>
              <Calculator className="h-4 w-4" aria-hidden /> PDA estimate
            </Link>
          )
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel className="min-w-0" bodyClassName="sm:p-7">
          {sent ? (
            <SentCard
              saved={sent}
              onAnother={() => {
                setInitial(initialRequestForm(null, user));
                setSent(null);
                setRound((r) => r + 1);
              }}
            />
          ) : (
            <>
              {fromEstimate && round === 0 ? (
                <p className="mb-6 flex items-center gap-2 rounded-xl bg-primary/[0.06] px-3.5 py-2.5 text-[13px] text-foreground/85">
                  <Calculator className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  Prefilled from your PDA estimate — add the vessel name and send.
                </p>
              ) : null}
              <RequestForm key={round} initial={initial} onSubmitted={setSent} />
            </>
          )}
        </Panel>

        <aside className="space-y-3 lg:sticky lg:top-4">
          <Panel title="What happens next">
            <ol className="space-y-4">
              {NEXT_STEPS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-xs leading-relaxed text-muted-foreground">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>
        </aside>
      </div>

      <MyRequests requests={mine} error={error} loading={isLoading} onRetry={() => void mutate()} highlightId={sent?.id ?? null} />
    </div>
  );
}
