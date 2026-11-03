"use client";

import { useState } from "react";
import { LogOut, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { ROLE_LABEL, roleId } from "@/lib/auth/roles";
import { exitDemo, resetDemo } from "@/lib/demo/session";
import { useDemoActive } from "@/lib/demo/useDemo";

const stripBtn =
  "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-white/85 transition hover:bg-white/10 hover:text-white disabled:opacity-50";

/** Slim strip above the top bar while the app runs on demo data */
export function DemoBanner() {
  const active = useDemoActive();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  if (!active) return null;

  const role = ROLE_LABEL[roleId(user) ?? 0];

  async function reset() {
    if (!window.confirm("Reset the demo? Every change you made in this browser is discarded.")) return;
    setBusy(true);
    try {
      await resetDemo();
      window.location.reload();
    } catch {
      toast.error("Could not reset the demo — reload the page and try again.");
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
      className="relative flex h-10 shrink-0 items-center gap-2 overflow-hidden border-b border-stage-expected/30 bg-sidebar px-3 text-white sm:px-5"
    >
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-primary/25 to-transparent" />
      <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stage-expected/15 text-stage-expected">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
      </span>
      <p className="relative min-w-0 flex-1 truncate text-xs text-white/75 sm:text-[13px]">
        <span className="font-semibold text-white">Demo data</span>
        <span className="hidden sm:inline"> — changes stay in this browser</span>
        {role ? <span className="ml-2 hidden rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/90 md:inline">as {role}</span> : null}
      </p>
      <div className="relative flex shrink-0 items-center gap-0.5">
        <button type="button" onClick={() => void reset()} disabled={busy} className={stripBtn} title="Restore the original demo data">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset
        </button>
        <button type="button" onClick={exit} disabled={busy} className={cn(stripBtn, "bg-white/10")}>
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          <span className="sm:hidden">Exit</span>
          <span className="hidden sm:inline">Exit demo</span>
        </button>
      </div>
    </div>
  );
}
