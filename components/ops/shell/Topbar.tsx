"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Menu, Moon, Radio, Sun, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit } from "@/lib/auth/roles";
import { useAisStatus, useVessels } from "@/lib/vessels/hooks";
import { isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { fmtRelative } from "@/lib/vessels/format";

function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

function UnpaidAlert() {
  const { data } = useVessels("all");
  const count = data?.filter(isUnpaidAfterDeparture).length ?? 0;
  if (!count) return null;
  return (
    <Link
      href="/vessels?view=unpaid"
      className="flex items-center gap-1.5 rounded-full bg-stage-unpaid/15 px-3 py-1.5 text-xs font-semibold text-stage-unpaid hover:bg-stage-unpaid/25"
    >
      <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
      {count} sailed unpaid
    </Link>
  );
}

function AisIndicator() {
  const { data } = useAisStatus();
  if (!data) return null;
  const label = !data.enabled
    ? "AIS off — positions are manual / estimated"
    : data.connected
      ? `AIS live · ${data.trackedVessels} tracked · last ${fmtRelative(data.lastMessageAt)}`
      : "AIS reconnecting…";
  return (
    <span
      title={label}
      className={cn(
        "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium md:flex",
        data.enabled && data.connected ? "border-ok/30 text-ok" : "text-muted-foreground",
      )}
    >
      <Radio className="h-3.5 w-3.5" aria-hidden />
      {data.enabled ? (data.connected ? "AIS live" : "AIS …") : "AIS off"}
    </span>
  );
}

export function Topbar({ title, onMenu }: { title?: string; onMenu: () => void }) {
  const { user } = useAuth();
  const staff = canEdit(user);
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur sm:px-5">
      <button
        type="button"
        onClick={onMenu}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</div>
      <div className="flex items-center gap-2">
        {staff ? <UnpaidAlert /> : null}
        {staff ? <AisIndicator /> : null}
        {!staff && user ? (
          <span className="hidden rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground sm:inline">
            Read-only access
          </span>
        ) : null}
        <ThemeSwitch />
      </div>
    </header>
  );
}
