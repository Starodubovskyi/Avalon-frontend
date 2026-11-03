"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, MailCheck, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit as isTeam } from "@/lib/auth/roles";
import { usePointExtras } from "@/lib/points/hooks";
import type { TeamPoint } from "@/lib/points/team-points";
import { Spinner, TextInput, btn } from "../ui/primitives";

const RESEND_MS = 60_000;

/** Small "Verified" pill used by cards and profiles */
export function VerifiedBadge({ className }: { className?: string }) {
  const t = useTranslations("points");
  return (
    <span
      className={cn("inline-flex shrink-0 items-center gap-1 rounded-full bg-ok/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ok", className)}
      title={t("email.verifiedHint")}
    >
      <BadgeCheck className="h-3 w-3" aria-hidden /> {t("email.verified")}
    </span>
  );
}

/**
 * Email of the point with its confirmation state. A saved, unconfirmed address can be confirmed by
 * a link sent to it; the team may mark it verified by hand. A changed address needs saving first.
 */
export function PointEmailField({ value, onChange, point }: { value: string; onChange: (v: string) => void; point: TeamPoint | null }) {
  const t = useTranslations("points");
  const { user } = useAuth();
  const { sendVerification, markVerified } = usePointExtras();
  const [busy, setBusy] = useState<"send" | "mark" | null>(null);
  const [error, setError] = useState<string | null>(null);
  // the server allows one confirmation email a minute (422 tooSoon), also across email changes
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [nowMs, setNowMs] = useState(0);
  const waitSeconds = Math.max(0, Math.ceil((cooldownUntil - nowMs) / 1000));
  useEffect(() => {
    if (!cooldownUntil) return;
    setNowMs(Date.now());
    const timer = window.setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      if (now >= cooldownUntil) {
        window.clearInterval(timer);
        setCooldownUntil(0);
        setError(null);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);
  const saved = point?.email ?? "";
  const unchanged = !!point && !!saved && value.trim() === saved;
  const editable = !!point?.canEdit;

  async function run(kind: "send" | "mark") {
    if (!point) return;
    setBusy(kind);
    setError(null);
    if (kind === "mark") {
      setError(await markVerified(point));
    } else {
      const failed = await sendVerification(point);
      setError(failed?.error ?? null);
      if (!failed || failed.tooSoon) setCooldownUntil(Date.now() + RESEND_MS);
    }
    setBusy(null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between gap-2 text-xs font-semibold text-foreground/80">
        <label htmlFor="point-email">{t("form.email")}</label>
        {unchanged && point?.emailVerified ? <VerifiedBadge /> : null}
      </span>
      <TextInput id="point-email" type="email" value={value} onChange={(e) => onChange(e.target.value)} maxLength={255} autoComplete="email" />
      {unchanged && !point?.emailVerified && editable ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="mr-auto text-xs text-muted-foreground">{t("email.notConfirmed")}</span>
          <button type="button" onClick={() => void run("send")} disabled={busy !== null || waitSeconds > 0} className={cn(btn.secondary, "h-9 px-3 text-xs")}>
            {busy === "send" ? <Spinner className="h-3.5 w-3.5" /> : <MailCheck className="h-3.5 w-3.5" />}
            {waitSeconds > 0 ? t("email.resendIn", { seconds: waitSeconds }) : t("email.send")}
          </button>
          {isTeam(user) ? (
            <button type="button" onClick={() => void run("mark")} disabled={busy !== null} className={cn(btn.ghost, "h-9 px-2.5 text-xs")}>
              {busy === "mark" ? <Spinner className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />} {t("email.markVerified")}
            </button>
          ) : null}
        </div>
      ) : null}
      {point && saved && value.trim() && !unchanged ? <span className="text-xs text-muted-foreground">{t("email.changed")}</span> : null}
      {(!point || !saved) && value.trim() ? <span className="text-xs text-muted-foreground">{t("email.afterSave")}</span> : null}
      {error ? (
        <span role="alert" className="text-xs text-bad">
          {error}
        </span>
      ) : null}
    </div>
  );
}
