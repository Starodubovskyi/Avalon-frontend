"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BadgeCheck, Clock3, LinkIcon, MailWarning, RefreshCw, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { fieldErrorCode, httpStatus } from "@/lib/api/fieldErrors";
import { TeamPointsApi } from "@/lib/points/team-points";
import { isDemoActive } from "@/lib/demo/mode";
import { exitDemo } from "@/lib/demo/session";
import { Spinner, btn } from "../ui/primitives";

type Failure = "missing" | "invalid" | "expired" | "stale" | "offline" | "generic";
type State = { kind: "loading" } | { kind: "done"; pointId: string; title: string; email: string } | { kind: "failed"; reason: Failure };

const FAILURE_ICON: Record<Failure, typeof ShieldAlert> = {
  missing: LinkIcon,
  invalid: ShieldAlert,
  expired: Clock3,
  stale: MailWarning,
  offline: RefreshCw,
  generic: ShieldAlert,
};

function failureOf(e: unknown): Failure {
  const code = fieldErrorCode(e, { token: ["invalid", "expired", "stale"] });
  if (code) return code.split(".")[1] as Failure;
  return httpStatus(e) === null ? "offline" : "generic";
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="brand-surface relative flex min-h-0 flex-1 overflow-y-auto">
      <div className="brand-aurora" aria-hidden />
      <div className="brand-grid" aria-hidden />
      <main className="relative z-10 m-auto flex w-full max-w-md flex-col items-center px-4 py-10">{children}</main>
    </div>
  );
}

/** Public landing of the confirmation link: POSTs the token once and shows the outcome */
export function VerifyEmailView() {
  const t = useTranslations("verifyEmail");
  const params = useSearchParams();
  // Read once: the token is then dropped from the address bar (history, shared screenshots)
  const [token] = useState(() => params?.get("token")?.trim() ?? "");
  const [state, setState] = useState<State>(token ? { kind: "loading" } : { kind: "failed", reason: "missing" });
  const [attempt, setAttempt] = useState(0);
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState({ kind: "failed", reason: "missing" });
      return;
    }
    const key = `${token}#${attempt}`;
    // React strict mode runs effects twice in development: the token must be spent only once
    if (sent.current === key) return;
    sent.current = key;
    window.history.replaceState(null, "", "/verify-email");
    // A real link opened in a browser that is exploring the demo goes to the real API
    if (isDemoActive() && !token.startsWith("demo-verify.")) exitDemo();
    setState({ kind: "loading" });
    TeamPointsApi.confirmEmail(token)
      .then((r) => setState({ kind: "done", pointId: r.pointId, title: r.title, email: r.email }))
      .catch((e: unknown) => setState({ kind: "failed", reason: failureOf(e) }));
  }, [token, attempt]);

  return (
    <Shell>
      <Link href="/" className="mb-6 flex items-center gap-2.5 text-white" aria-label="Avalon Shipping">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-1 shadow-elevated">
          <Image src="/brand/avalon-icon-192.png" alt="" width={32} height={32} priority />
        </span>
        <span className="font-display text-lg font-bold tracking-tight">Avalon Shipping</span>
      </Link>

      <section className="w-full rounded-3xl border border-white/10 bg-card p-6 text-center text-card-foreground shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:p-8" aria-live="polite">
        {state.kind === "loading" ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="font-display text-lg font-bold">{t("loading")}</p>
          </div>
        ) : state.kind === "done" ? (
          <div className="flex flex-col items-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-ok/10 text-ok">
              <span className="absolute inset-0 animate-ping rounded-2xl bg-ok/10 [animation-iteration-count:2]" aria-hidden />
              <BadgeCheck className="h-8 w-8" aria-hidden />
            </span>
            <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">{t("done.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("done.text")}</p>
            <dl className="mt-5 w-full space-y-2 rounded-2xl border bg-muted/40 p-4 text-left text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{t("done.company")}</dt>
                <dd className="min-w-0 truncate font-semibold">{state.title}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{t("done.email")}</dt>
                <dd className="min-w-0 break-all font-medium">{state.email}</dd>
              </div>
            </dl>
            <Link href={`/companies/${state.pointId}`} className={cn(btn.primary, "mt-6 h-11 w-full")}>
              {t("done.open")} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className={cn(btn.ghost, "mt-2 h-10")}>
              {t("home")}
            </Link>
          </div>
        ) : (
          <Failed reason={state.reason} onRetry={() => setAttempt((a) => a + 1)} />
        )}
      </section>
      <p className="mt-6 text-center text-xs text-white/55">{t("footer")}</p>
    </Shell>
  );
}

function Failed({ reason, onRetry }: { reason: Failure; onRetry: () => void }) {
  const t = useTranslations("verifyEmail");
  const Icon = FAILURE_ICON[reason];
  const retryable = reason === "offline" || reason === "generic";
  return (
    <div className="flex flex-col items-center">
      <span className={cn("flex h-16 w-16 items-center justify-center rounded-2xl", reason === "expired" ? "bg-stage-expected/10 text-stage-expected" : "bg-bad/10 text-bad")}>
        <Icon className="h-8 w-8" aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">{t(`errors.${reason}.title`)}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t(`errors.${reason}.text`)}</p>
      {retryable ? (
        <button type="button" onClick={onRetry} className={cn(btn.primary, "mt-6 h-11 w-full")}>
          <RefreshCw className="h-4 w-4" /> {t("retry")}
        </button>
      ) : (
        <Link href="/maps" className={cn(btn.primary, "mt-6 h-11 w-full")}>
          {t("openMap")} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
      <Link href="/" className={cn(btn.ghost, "mt-2 h-10")}>
        {t("home")}
      </Link>
    </div>
  );
}
