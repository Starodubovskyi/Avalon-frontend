import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Inbox, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { errorKind } from "@/lib/api/errorText";

export function Spinner({ className }: { className?: string }) {
  const t = useTranslations("common");
  return <Loader2 className={cn("h-5 w-5 animate-spin text-muted-foreground", className)} aria-label={t("loading")} />;
}

export function LoadingBlock({ label }: { label?: string }) {
  const t = useTranslations("common");
  return (
    <div role="status" className="flex items-center justify-center gap-2.5 py-16 text-sm text-muted-foreground">
      <Spinner className="h-4 w-4" /> {label ?? t("loading")}
    </div>
  );
}

export function ErrorBlock({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useTranslations("common");
  // never the raw error.message (English, server codes): a translated sentence per failure kind.
  // A load rejected as invalid (bad id in the URL) reads as "not found", not as a form problem.
  const kind = errorKind(error);
  const message = t(`errors.${kind === "validation" ? "notFound" : kind}`);
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bad/25 bg-bad/[0.05] px-4 py-3 text-sm text-bad shadow-card"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bad/10">
          <AlertTriangle className="h-4 w-4" aria-hidden />
        </span>
        <span className="min-w-0 break-words">{message}</span>
      </span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-bad/25 bg-card px-3 text-xs font-semibold transition hover:bg-bad/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bad/40"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> {t("retry")}
        </button>
      ) : null}
    </div>
  );
}

/** Calm empty state: an icon on a layered tile, a title, one line of help and an optional action */
export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center">
      <div className="relative mb-3" aria-hidden>
        <span className="absolute -inset-3 rounded-[22px] bg-primary/[0.04] ring-1 ring-primary/[0.06]" />
        <span className="absolute -inset-1.5 rounded-[18px] bg-primary/[0.05]" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-b from-card to-accent text-primary shadow-raised [&>svg]:h-6 [&>svg]:w-6">
          {icon ?? <Inbox />}
        </span>
      </div>
      <p className="font-display text-[15px] font-bold tracking-[-0.01em]">{title}</p>
      {text ? <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
