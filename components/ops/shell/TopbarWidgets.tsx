"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useFormatter, useTranslations } from "next-intl";
import { Moon, Radio, Sun, TriangleAlert, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAisStatus, useVessels } from "@/lib/vessels/hooks";
import { isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { useWallet } from "@/lib/wallet/hooks";
import { btn } from "../ui/primitives";

/** "1 250": credits grouped with a narrow no-break space, the same in every language */
export function fmtCredits(amount: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount).replace(/,/g, " ");
}

export function ThemeSwitch({ className }: { className?: string }) {
  const t = useTranslations("common");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(btn.icon, className)}
      aria-label={dark ? t("theme.toLight") : t("theme.toDark")}
      title={dark ? t("theme.toLight") : t("theme.toDark")}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden /> : <Moon className="h-[18px] w-[18px]" aria-hidden />}
    </button>
  );
}

/** Sailed without payment: the one alert that must always be visible to staff */
export function UnpaidAlert() {
  const t = useTranslations("shell");
  const { data } = useVessels("all");
  const count = data?.filter(isUnpaidAfterDeparture).length ?? 0;
  if (!count) return null;
  return (
    <Link
      href="/vessels?view=unpaid"
      aria-label={t("unpaidAlert", { count })}
      title={t("unpaidAlert", { count })}
      className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-stage-unpaid/25 bg-stage-unpaid/10 px-2.5 text-xs font-semibold text-stage-unpaid transition hover:bg-stage-unpaid/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stage-unpaid/40"
    >
      <span className="relative flex h-3.5 w-3.5 items-center justify-center">
        <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="tabular sm:hidden">{count}</span>
      <span className="hidden sm:inline">{t("unpaidAlert", { count })}</span>
    </Link>
  );
}

export function AisIndicator() {
  const t = useTranslations("shell");
  const format = useFormatter();
  const { data } = useAisStatus();
  if (!data) return null;
  const live = data.enabled && data.connected;
  const last = data.lastMessageAt ? format.relativeTime(new Date(data.lastMessageAt), new Date()) : t("never");
  const label = !data.enabled
    ? t("aisOffHint")
    : data.connected
      ? t("aisLiveHint", { count: data.trackedVessels, last })
      : t("aisReconnecting");
  return (
    <span
      title={label}
      className={cn(
        "hidden h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold md:flex",
        live ? "border-ok/30 bg-ok/[0.06] text-ok" : "text-muted-foreground",
      )}
    >
      {live ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-ok/60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
        </span>
      ) : (
        <Radio className="h-3.5 w-3.5" aria-hidden />
      )}
      {data.enabled ? (data.connected ? t("aisLive") : t("aisWaiting")) : t("aisOff")}
    </span>
  );
}

/** Credits balance; hidden only while there is no data yet (a transient refresh error keeps the last value) */
export function BalanceChip() {
  const t = useTranslations("shell");
  const tc = useTranslations("common");
  const { data } = useWallet();
  if (!data || typeof data.balance !== "number") return null;
  const amount = fmtCredits(data.balance);
  return (
    <Link
      href="/balance"
      aria-label={t("balanceChip", { amount })}
      title={t("balanceChip", { amount })}
      className="group flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border bg-card pl-1 pr-2.5 text-xs font-semibold text-foreground shadow-card transition hover:border-primary/30 hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-primary to-primary-strong text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
        <Wallet className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="tabular">{tc("credits", { amount })}</span>
    </Link>
  );
}
