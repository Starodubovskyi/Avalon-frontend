"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Anchor,
  ArrowUpRight,
  Building2,
  Calculator,
  LayoutDashboard,
  Map,
  MessageCircle,
  Send,
  Ship,
  Sparkles,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader, btn } from "../ui/primitives";

const GUIDES: { id: string; href: string; icon: LucideIcon }[] = [
  { id: "overview", href: "/dashboard", icon: LayoutDashboard },
  { id: "vessels", href: "/vessels", icon: Ship },
  { id: "map", href: "/maps", icon: Map },
  { id: "companies", href: "/companies", icon: Building2 },
  { id: "request", href: "/request", icon: Send },
  { id: "estimate", href: "/estimate", icon: Calculator },
  { id: "balance", href: "/balance", icon: Wallet },
  { id: "portGuide", href: "/port-guide", icon: Anchor },
];

/** Real help: talk to the Avalon team, short guides to the sections that exist, the assistant in the corner */
export function SupportView() {
  const t = useTranslations("support.page");
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      <section className="relative overflow-hidden rounded-3xl border bg-[linear-gradient(135deg,hsl(var(--primary-strong)),hsl(var(--primary)))] p-6 text-white shadow-raised sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-white/70">{t("contact.eyebrow")}</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.02em]">{t("contact.title")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{t("contact.text")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
            <Link href="/chat" className={cn(btn.secondary, "h-11 justify-center border-white/20 bg-white text-slate-900 hover:border-white hover:bg-white/90")}>
              <MessageCircle className="h-4 w-4" aria-hidden /> {t("contact.chat")}
            </Link>
            <Link href="/request" className={cn(btn.secondary, "h-11 justify-center border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/20")}>
              <Send className="h-4 w-4" aria-hidden /> {t("contact.request")}
            </Link>
          </div>
        </div>
        <p className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/85">
          <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t("contact.assistant")}
        </p>
      </section>

      <section aria-labelledby="support-guides" className="space-y-3">
        <h2 id="support-guides" className="font-display text-lg font-bold tracking-[-0.01em]">
          {t("guides.title")}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {GUIDES.map(({ id, href, icon: Icon }) => (
            <li key={id}>
              <Link
                href={href}
                className="focus-ring group flex h-full flex-col rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-raised"
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" aria-hidden />
                </span>
                <span className="mt-4 font-semibold">{t(`guides.${id}.title`)}</span>
                <span className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(`guides.${id}.text`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
