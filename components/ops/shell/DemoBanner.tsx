"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { exitDemo, resetDemo } from "@/lib/demo/session";
import { useDemoActive } from "@/lib/demo/useDemo";
import { roleKeyOf } from "./roleKey";

const stripBtn =
  "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-white/85 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50";

/** Slim strip above the top bar while the app runs on demo data */
export function DemoBanner() {
  const t = useTranslations("demo");
  const tc = useTranslations("common");
  const active = useDemoActive();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  if (!active) return null;

  const roleKey = roleKeyOf(user);

  async function reset() {
    if (!window.confirm(t("resetConfirm"))) return;
    setBusy(true);
    try {
      await resetDemo();
      window.location.reload();
    } catch {
      toast.error(t("resetFailed"));
      setBusy(false);
    }
  }

  function exit() {
    exitDemo();
    window.location.assign("/auth");
  }

  return (
    <div
      role="status"
      className="relative flex h-10 shrink-0 items-center gap-2 overflow-hidden border-b border-white/[0.06] bg-sidebar px-3 text-white sm:px-5"
    >
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-primary/25 to-transparent" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-stage-expected/0 via-stage-expected/50 to-stage-expected/0" />
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stage-expected/15 text-stage-expected ring-1 ring-inset ring-stage-expected/25">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
      </span>
      <p className="relative min-w-0 flex-1 truncate text-xs text-white/75 sm:text-[13px]">
        <span className="font-semibold text-white">{t("title")}</span>
        <span className="hidden sm:inline"> — {t("subtitle")}</span>
        {roleKey !== "user" ? (
          <span className="ml-2 hidden rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/90 md:inline">
            {t("asRole", { role: tc(`role.${roleKey}`) })}
          </span>
        ) : null}
      </p>
      <div className="relative flex shrink-0 items-center gap-0.5">
        <button type="button" onClick={() => void reset()} disabled={busy} className={stripBtn} title={t("resetHint")}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          {t("reset")}
        </button>
        <button type="button" onClick={exit} disabled={busy} className={cn(stripBtn, "bg-white/10")}>
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          <span className="sm:hidden">{t("exit")}</span>
          <span className="hidden sm:inline">{t("exitDemo")}</span>
        </button>
      </div>
    </div>
  );
}
