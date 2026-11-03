import {
  Anchor,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  LifeBuoy,
  Navigation,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { StageBadge } from "@/components/ops/ui/StageBadge";
import { ChecklistChip } from "../brand/ChecklistChip";
import { PublicSectionHeader } from "../PublicShell";

const SERVICES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Anchor,
    title: "Port agency",
    text: "Full agency for loading and discharge calls: nominations, berth planning, authorities and terminals.",
  },
  {
    icon: LifeBuoy,
    title: "Husbandry",
    text: "Owners' matters handled alongside: spares, provisions, bunkers, surveys, repairs and cash to master.",
  },
  {
    icon: FileCheck2,
    title: "Customs & T1",
    text: "Transit documents, MSW declarations and border formalities in Romania, Ukraine and Moldova.",
  },
  {
    icon: Users,
    title: "Crew change",
    text: "Visas, sign-on and sign-off, transport, hotels and medical assistance for crew members.",
  },
  {
    icon: Navigation,
    title: "Sulina pilotage",
    text: "Pilot orders, channel dues and transit slots arranged before the vessel reaches the roads.",
  },
  {
    icon: ClipboardCheck,
    title: "Cargo supervision",
    text: "Tally, draft surveys and loading supervision with daily reports to owners and charterers.",
  },
];

const STEPS: { title: string; text: string; visual: ReactNode }[] = [
  {
    title: "Nominate",
    text: "Send the vessel, ETA and cargo. We confirm and send the proforma (PDA).",
    visual: (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
        <Send className="h-3.5 w-3.5" aria-hidden /> Nomination received
      </span>
    ),
  },
  {
    title: "Pre-arrival",
    text: "Prearrivals, MSW, T1 and pilot orders — every item red until done.",
    visual: (
      <span className="flex flex-wrap gap-1">
        {["PRE IN", "MSW IN", "T1", "PILOT"].map((c, i) => (
          <ChecklistChip key={c} label={c} done flip index={i} />
        ))}
      </span>
    ),
  },
  {
    title: "Port call",
    text: "Sulina transit, berthing, cargo operations and sailing, live on your board.",
    visual: (
      <span className="flex flex-wrap gap-1.5">
        <StageBadge stage="at_roads" />
        <StageBadge stage="in_port" />
      </span>
    ),
  },
  {
    title: "FDA",
    text: "Final disbursement account with vouchers, settled against the PDA.",
    visual: (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/25 bg-ok/10 px-2.5 py-1 text-[11px] font-semibold text-ok">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Settled against PDA
      </span>
    ),
  },
];

export function HomeServices() {
  return (
    <section id="services" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <PublicSectionHeader
            eyebrow="Services"
            title="Everything a Danube call needs"
            subtitle="One agency team from the first nomination email to the final account — on the river every day."
          />
        </div>
        <ul className="reveal mt-12 grid gap-px overflow-hidden rounded-[24px] border bg-border shadow-card sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="group relative bg-card p-6 transition-colors hover:bg-accent/40 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.08] text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-[17px] font-bold tracking-[-0.01em]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeProcess() {
  return (
    <section id="process" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PublicSectionHeader
          eyebrow="How we work"
          title="Four steps, no surprises"
          subtitle="The same checklist our team uses on the board — you see each step turn from red to green."
          align="center"
        />
        <ol className="relative mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* connector: shows in the gaps between the cards, level with the step numbers */}
          <span
            aria-hidden
            className="absolute left-10 right-10 top-[47px] hidden h-0.5 rounded-full bg-gradient-to-r from-primary/20 via-primary/60 to-ok/60 lg:block"
          />
          {STEPS.map((s, i) => (
            <li key={s.title} className="reveal relative flex flex-col rounded-[22px] border bg-card p-5 shadow-card sm:p-6">
              <span className="tabular flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--brand-navy))] font-display text-base font-extrabold text-white shadow-[0_10px_24px_-10px_hsl(var(--primary))]">
                0{i + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold tracking-[-0.01em]">{s.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              <div className="mt-5 border-t pt-4">{s.visual}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
