import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarRange,
  Calculator,
  ClipboardList,
  LayoutList,
  MapPinned,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicSectionHeader } from "../PublicShell";
import { BoardVisual, LineupVisual, MapVisual, PointVisual } from "./bento/OpsVisuals";
import { ChatVisual, PdaVisual, RequestVisual } from "./bento/ClientVisuals";

function BentoCard({
  icon: Icon,
  title,
  text,
  link,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  link?: { href: string; label: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={cn(
        "reveal group relative flex flex-col overflow-hidden rounded-[24px] border bg-card p-5 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-elevated sm:p-6",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/[0.07] blur-2xl transition group-hover:bg-primary/[0.12]" />
      <div className="relative flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--brand-navy))] text-white shadow-[0_8px_20px_-10px_hsl(var(--primary))]">
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>
        {link ? (
          <Link
            href={link.href}
            className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {link.label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </div>
      <h3 className="relative mt-4 text-lg font-bold tracking-[-0.01em]">{title}</h3>
      <p className="relative mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
      <div className="relative mt-5 flex-1">{children}</div>
    </article>
  );
}

/** What the client portal does, as a bento grid of small product views */
export function HomeBento() {
  return (
    <section id="platform" className="scroll-mt-20 px-2 sm:px-4">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[28px] border bg-muted/50 px-3 py-16 sm:rounded-[32px] sm:px-8 sm:py-24 lg:px-16">
        <div className="surface-grid" aria-hidden />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6 px-1">
            <PublicSectionHeader
              eyebrow="The portal"
              title="One live board for the whole call"
              subtitle="The Avalon team runs every call on it. Owners and charterers follow the same board, read-only — no chasing emails."
            />
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <BentoCard
              icon={LayoutList}
              title="Live vessel board"
              text="Expected, at the Sulina roads, in port, departed — and every checklist item red until it is done."
              className="lg:col-span-2"
            >
              <BoardVisual />
            </BentoCard>
            <BentoCard
              icon={MapPinned}
              title="Fleet map with company geopoints"
              text="Vessels on the river next to agents, terminals, authorities and suppliers."
            >
              <MapVisual />
            </BentoCard>
            <BentoCard icon={CalendarRange} title="Line-up" text="Arrivals and berth windows across the week, port by port.">
              <LineupVisual />
            </BentoCard>
            <BentoCard
              icon={Calculator}
              title="PDA estimate"
              text="Indicative disbursements in seconds, then a firm PDA from the team."
              link={{ href: "/estimate", label: "Estimate" }}
            >
              <PdaVisual />
            </BentoCard>
            <BentoCard
              icon={ClipboardList}
              title="Agency requests"
              text="Nominate online; follow the request from received to confirmed."
              link={{ href: "/request", label: "Request" }}
            >
              <RequestVisual />
            </BentoCard>
            <BentoCard
              icon={MessagesSquare}
              title="Team chat"
              text="Talk to the people handling your vessel, with documents attached — instead of long email threads."
              className="lg:col-span-2"
            >
              <ChatVisual />
            </BentoCard>
            <BentoCard
              icon={Building2}
              title="Company cards and Rank"
              text="Logo, Business Activity and Rank on every point — chat, share or save it to your favourites."
            >
              <PointVisual />
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
}
