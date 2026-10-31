import {
  Anchor,
  ClipboardCheck,
  FileCheck2,
  LifeBuoy,
  Navigation,
  Send,
  Ship,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
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

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Send, title: "Nominate", text: "Send the vessel, ETA and cargo. We confirm and send the proforma (PDA)." },
  { icon: FileCheck2, title: "Pre-arrival", text: "Prearrivals, MSW, T1 and pilot orders — every item red until done." },
  { icon: Ship, title: "Port call", text: "Sulina transit, berthing, cargo operations and sailing, live on your board." },
  { icon: Wallet, title: "FDA", text: "Final disbursement account with vouchers, settled against the PDA." },
];

export function HomeServices() {
  return (
    <section id="services" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PublicSectionHeader
          eyebrow="Services"
          title="Everything a Danube call needs"
          subtitle="One agency team from the first nomination email to the final account — on the river every day."
        />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {SERVICES.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated sm:p-6"
            >
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.06] transition group-hover:bg-primary/10" />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-[0_8px_18px_-8px_hsl(var(--primary))]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="relative mt-4 text-[17px] font-bold">{title}</h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeProcess() {
  return (
    <section id="process" className="scroll-mt-20 px-4 pb-4 pt-16 sm:px-6 sm:pb-8 sm:pt-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PublicSectionHeader
          eyebrow="How we work"
          title="Four steps, no surprises"
          subtitle="The same checklist our team uses on the board — you see each step turn from red to green."
          align="center"
        />
        <div className="relative mt-12">
          <div aria-hidden className="absolute bottom-6 left-[22px] top-6 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:bottom-auto md:left-6 md:right-6 md:top-[22px] md:h-px md:w-auto md:bg-gradient-to-r" />
          <ol className="relative grid gap-4 md:grid-cols-4 md:gap-5">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative flex gap-4 md:flex-col md:gap-0">
                <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-[0_8px_18px_-8px_hsl(var(--primary))]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="flex-1 rounded-2xl border bg-card p-4 shadow-card md:mt-4 md:p-5">
                  <p className="tabular text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Step {i + 1}</p>
                  <h3 className="mt-1 text-[17px] font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
