"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Calculator, Map as MapIcon, Plus, Send, Wallet, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { VesselFormDialog } from "../vessels/VesselFormDialog";

const TILE =
  "group relative flex min-h-[92px] flex-col justify-between overflow-hidden rounded-2xl border bg-card p-3.5 text-left shadow-card transition duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

function ActionBody({ icon: Icon, title, text, tone }: { icon: LucideIcon; title: string; text: string; tone: string }) {
  return (
    <>
      <span className="flex items-start justify-between gap-2">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]", tone)}>
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
      </span>
      <span className="mt-3 block min-w-0">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{text}</span>
      </span>
    </>
  );
}

function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={TILE}>
      {children}
    </Link>
  );
}

/** Four shortcuts; staff get "Add vessel" (opens the same form as the board), clients the PDA estimate */
export function QuickActions({ staff }: { staff: boolean }) {
  const t = useTranslations("dashboard");
  const [formOpen, setFormOpen] = useState(false);
  return (
    <section aria-labelledby="quick-actions">
      <h2 id="quick-actions" className="mb-3 font-display text-[15px] font-bold tracking-[-0.01em]">
        {t("actions.title")}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {staff ? (
          <button type="button" onClick={() => setFormOpen(true)} className={TILE}>
            <ActionBody icon={Plus} title={t("actions.addVessel")} text={t("actions.addVesselText")} tone="bg-gradient-to-b from-primary to-primary-strong" />
          </button>
        ) : (
          <ActionLink href="/estimate">
            <ActionBody icon={Calculator} title={t("actions.estimate")} text={t("actions.estimateText")} tone="bg-gradient-to-b from-primary to-primary-strong" />
          </ActionLink>
        )}
        <ActionLink href="/request">
          <ActionBody icon={Send} title={t("actions.request")} text={t("actions.requestText")} tone="bg-gradient-to-b from-stage-roads to-[hsl(192_80%_28%)]" />
        </ActionLink>
        <ActionLink href="/maps">
          <ActionBody icon={MapIcon} title={t("actions.map")} text={t("actions.mapText")} tone="bg-gradient-to-b from-[hsl(var(--brand-navy))] to-[hsl(var(--brand-deep))]" />
        </ActionLink>
        <ActionLink href="/balance">
          <ActionBody icon={Wallet} title={t("actions.balance")} text={t("actions.balanceText")} tone="bg-gradient-to-b from-violet-500 to-indigo-700" />
        </ActionLink>
      </div>
      {staff ? <VesselFormDialog open={formOpen} onOpenChange={setFormOpen} /> : null}
    </section>
  );
}
