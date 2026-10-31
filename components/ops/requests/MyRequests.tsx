"use client";

import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/network/hooks";
import { REQUEST_STATUS_META, type AgencyRequest } from "@/lib/requests/types";
import { EmptyState, ErrorBlock, LoadingBlock } from "../ui/primitives";
import { AgentNote, RequestSummary } from "./RequestBits";

function MyRequestItem({ r, now, highlight }: { r: AgencyRequest; now: number; highlight: boolean }) {
  return (
    <li
      className={cn(
        "min-w-0 rounded-2xl border bg-card p-4 shadow-card transition sm:p-5",
        highlight && "border-primary/40 ring-4 ring-primary/10",
      )}
    >
      <RequestSummary request={r} now={now} sentLabel="Sent" />

      <p className="mt-3 text-xs text-muted-foreground">{REQUEST_STATUS_META[r.status].hint}</p>
      {r.staffNote ? <AgentNote note={r.staffNote} className="mt-2" /> : null}
      {r.status === "accepted" && r.vesselId ? (
        <Link href={`/vessels/${r.vesselId}`} className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          Follow {r.vesselName} on the board <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </li>
  );
}

export function MyRequests({
  requests,
  error,
  loading,
  onRetry,
  highlightId,
}: {
  requests: AgencyRequest[] | undefined;
  error: unknown;
  loading: boolean;
  onRetry: () => void;
  highlightId: string | null;
}) {
  const now = useNow();
  return (
    <section id="your-requests" className="scroll-mt-20 space-y-4" aria-labelledby="your-requests-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 id="your-requests-title" className="font-display text-xl font-bold tracking-tight">
            Your requests
          </h2>
          <p className="text-sm text-muted-foreground">Status and the agent&apos;s replies, newest first.</p>
        </div>
        {requests?.length ? <span className="tabular rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{requests.length}</span> : null}
      </div>

      {error ? <ErrorBlock error={error} onRetry={onRetry} /> : null}
      {loading && !requests ? <LoadingBlock label="Loading your requests…" /> : null}
      {requests && requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card">
          <EmptyState icon={<Inbox className="h-7 w-7" />} title="No requests yet" text="Requests you send appear here with the agent's reply." />
        </div>
      ) : null}
      {requests?.length ? (
        <ul className="grid gap-3 xl:grid-cols-2">
          {requests.map((r) => (
            <MyRequestItem key={r.id} r={r} now={now} highlight={r.id === highlightId} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
