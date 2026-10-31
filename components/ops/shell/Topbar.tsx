"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Menu, Moon, Radio, Search, Sun, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { canEdit, displayName } from "@/lib/auth/roles";
import { useAisStatus, useVessels } from "@/lib/vessels/hooks";
import { STAGE_META, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { fmtRelative } from "@/lib/vessels/format";
import { DESTINATION_LABEL } from "@/lib/vessels/types";
import { Avatar, btn } from "../ui/primitives";

function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={btn.icon}
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
      className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-stage-unpaid/25 bg-stage-unpaid/10 px-3 py-1.5 text-xs font-semibold text-stage-unpaid transition hover:bg-stage-unpaid/15"
    >
      <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
      {count} <span className="hidden sm:inline">sailed</span> unpaid
    </Link>
  );
}

function AisIndicator() {
  const { data } = useAisStatus();
  if (!data) return null;
  const live = data.enabled && data.connected;
  const label = !data.enabled
    ? "AIS off — positions are manual / estimated"
    : data.connected
      ? `AIS live · ${data.trackedVessels} tracked · last ${fmtRelative(data.lastMessageAt)}`
      : "AIS reconnecting…";
  return (
    <span
      title={label}
      className={cn(
        "hidden items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold md:flex",
        live ? "border-ok/30 bg-ok/5 text-ok" : "text-muted-foreground",
      )}
    >
      {live ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ok" /> : <Radio className="h-3.5 w-3.5" aria-hidden />}
      {data.enabled ? (data.connected ? "AIS live" : "AIS …") : "AIS off"}
    </span>
  );
}

/** Jump to any vessel by name or IMO from every page */
function QuickSearch() {
  const router = useRouter();
  const { data } = useVessels("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return (data ?? []).filter((v) => v.name.toLowerCase().includes(s) || (v.imo ?? "").includes(s)).slice(0, 6);
  }, [data, q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={boxRef} className="relative hidden w-full max-w-sm md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) {
            router.push(`/vessels/${results[0].id}`);
            setOpen(false);
            setQ("");
          }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search vessel or IMO…"
        aria-label="Search vessels"
        className="h-10 w-full rounded-xl border border-transparent bg-muted pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:bg-card focus:ring-4 focus:ring-primary/10"
      />
      {open && results.length ? (
        <ul className="shadow-elevated absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border bg-popover p-1">
          {results.map((v) => (
            <li key={v.id}>
              <Link
                href={`/vessels/${v.id}`}
                onClick={() => {
                  setOpen(false);
                  setQ("");
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent"
              >
                <span className={cn("h-2 w-2 rounded-full", STAGE_META[v.stage].dot)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{v.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {STAGE_META[v.stage].label} → {DESTINATION_LABEL[v.destination]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Topbar({ title, onMenu }: { title?: string; onMenu: () => void }) {
  const { user } = useAuth();
  const staff = canEdit(user);
  const today = useMemo(
    () => new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date()),
    [],
  );
  return (
    <header className="glass sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b px-3 sm:px-6">
      <button type="button" onClick={onMenu} className={cn(btn.icon, "lg:hidden")} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0 shrink-0 leading-tight">
        <p className="truncate font-display text-[15px] font-bold">{title}</p>
        <p className="hidden text-[11px] text-muted-foreground sm:block">{today}</p>
      </div>
      <div className="flex flex-1 justify-center px-2">
        <QuickSearch />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {staff ? <UnpaidAlert /> : null}
        {staff ? <AisIndicator /> : null}
        {!staff && user ? (
          <span className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground sm:flex">
            <Eye className="h-3.5 w-3.5" /> Read-only
          </span>
        ) : null}
        <ThemeSwitch />
        <Link href="/account" className="hidden rounded-full ring-2 ring-transparent transition hover:ring-primary/30 sm:block" aria-label="Account">
          <Avatar name={displayName(user) || "User"} />
        </Link>
      </div>
    </header>
  );
}
