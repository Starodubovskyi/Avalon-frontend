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
import { useTranslations } from "next-intl";
import { StageBadge } from "@/components/ops/ui/StageBadge";
import { ChecklistChip } from "../brand/ChecklistChip";
import { PublicSectionHeader } from "../PublicShell";

type ServiceKey = "agency" | "husbandry" | "customs" | "crew" | "pilotage" | "supervision";

const SERVICES: { icon: LucideIcon; key: ServiceKey }[] = [
  { icon: Anchor, key: "agency" },
  { icon: LifeBuoy, key: "husbandry" },
  { icon: FileCheck2, key: "customs" },
  { icon: Users, key: "crew" },
  { icon: Navigation, key: "pilotage" },
  { icon: ClipboardCheck, key: "supervision" },
];

type StepKey = "nominate" | "prearrival" | "portCall" | "fda";

function StepVisual({ step }: { step: StepKey }): ReactNode {
  const t = useTranslations("home");
  if (step === "nominate") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
        <Send className="h-3.5 w-3.5" aria-hidden /> {t("process.received")}
      </span>
    );
  }
  if (step === "prearrival") {
    return (
      <span className="flex flex-wrap gap-1">
        {["PRE IN", "MSW IN", "T1", "PILOT"].map((c, i) => (
          <ChecklistChip key={c} label={c} done flip index={i} />
        ))}
      </span>
    );
  }
  if (step === "portCall") {
    return (
      <span className="flex flex-wrap gap-1.5">
        <StageBadge stage="at_roads" />
        <StageBadge stage="in_port" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/25 bg-ok/10 px-2.5 py-1 text-[11px] font-semibold text-ok">
      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("process.settled")}
    </span>
  );
}

const STEPS: StepKey[] = ["nominate", "prearrival", "portCall", "fda"];

export function HomeServices() {
  const t = useTranslations("home");
  return (
    <section id="services" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <PublicSectionHeader eyebrow={t("services.eyebrow")} title={t("services.title")} subtitle={t("services.subtitle")} />
        </div>
        <ul className="reveal mt-12 grid gap-px overflow-hidden rounded-[24px] border bg-border shadow-card sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, key }) => (
            <li key={key} className="group relative bg-card p-6 transition-colors hover:bg-surface sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.08] text-primary transition duration-200 group-hover:border-transparent group-hover:bg-gradient-to-b group-hover:from-primary group-hover:to-primary-strong group-hover:text-primary-foreground group-hover:shadow-[0_8px_20px_-10px_hsl(var(--primary))]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-[17px] font-bold tracking-[-0.015em]">{t(`services.items.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`services.items.${key}.text`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeProcess() {
  const t = useTranslations("home");
  return (
    <section id="process" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PublicSectionHeader eyebrow={t("process.eyebrow")} title={t("process.title")} subtitle={t("process.subtitle")} align="center" />
        <ol className="relative mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* connector: shows in the gaps between the cards, level with the step numbers */}
          <span
            aria-hidden
            className="absolute left-10 right-10 top-[47px] hidden h-0.5 rounded-full bg-gradient-to-r from-primary/20 via-primary/60 to-ok/60 lg:block"
          />
          {STEPS.map((s, i) => (
            <li key={s} className="reveal relative flex flex-col rounded-[22px] border bg-card p-5 shadow-card sm:p-6">
              <span className="tabular flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--brand-navy))] font-display text-base font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_24px_-10px_hsl(var(--primary))]">
                0{i + 1}
              </span>
              <h3 className="mt-5 font-display text-lg font-bold tracking-[-0.015em]">{t(`process.steps.${s}.title`)}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{t(`process.steps.${s}.text`)}</p>
              <div className="mt-5 border-t pt-4">
                <StepVisual step={s} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
