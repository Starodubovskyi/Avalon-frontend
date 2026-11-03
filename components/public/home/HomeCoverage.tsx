import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PORT_GUIDE, SULINA_CHANNEL, type CountryCode } from "@/lib/public/portGuide";
import { DanubeArt } from "../brand/DanubeArt";
import { PublicSectionHeader } from "../PublicShell";

/** Upstream order from the sea, as a vessel meets them */
const ROUTE = ["TULCEA", "IZMAIL", "ORLIVKA", "RENI", "GIURGIULESTI", "GALATI", "BRAILA"] as const;

const STOPS: { id: string; name: string; country: CountryCode | null; code: string | null; sea: boolean }[] = [
  { id: "sulina", name: "Sulina", country: null, code: SULINA_CHANNEL.unlocode, sea: true },
  ...ROUTE.map((id) => {
    const p = PORT_GUIDE.find((g) => g.id === id);
    return { id: id.toLowerCase(), name: p?.name ?? id, country: p?.country ?? null, code: p?.unlocode ?? null, sea: false };
  }),
];

export function HomeCoverage() {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  return (
    <section id="coverage" className="scroll-mt-20 px-2 py-16 sm:px-4 sm:py-24">
      <div className="brand-surface relative isolate mx-auto max-w-[1440px] overflow-hidden rounded-[28px] px-5 py-14 text-white sm:rounded-[32px] sm:px-10 sm:py-20 lg:px-16">
        <div className="brand-aurora" aria-hidden />
        <div className="brand-grid" aria-hidden />
        <div className="noise-overlay" aria-hidden />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <PublicSectionHeader inverted eyebrow={t("coverage.eyebrow")} title={t("coverage.title")} subtitle={t("coverage.subtitle")} />
            <Link
              href="/port-guide"
              className="group inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur transition hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {t("coverage.open")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>

          <div className="reveal mt-10 rounded-[24px] border border-white/10 bg-white/[0.03] p-3 sm:mt-14 sm:p-8">
            <DanubeArt id="coverage" labels countries strong title={t("coverage.mapTitle")} />
          </div>

          <ol className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 xl:grid-cols-8">
            {STOPS.map((s, i) => (
              <li key={s.id}>
                <Link
                  href={`/port-guide#${s.id}`}
                  className="group flex h-full min-h-[64px] flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 transition hover:border-[hsl(var(--brand-accent)/0.5)] hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "tabular flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        s.sea ? "bg-[hsl(var(--brand-accent))] text-[hsl(var(--brand-deep))]" : "bg-white/15 text-white",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="truncate font-display text-[15px] font-bold text-white transition group-hover:text-[hsl(var(--brand-accent))]">
                      {s.name}
                    </span>
                  </span>
                  <span className="mt-1 block truncate pl-7 text-[11px] text-white/55">
                    {s.sea ? t("coverage.channel", { code: s.code ?? "" }) : `${s.country ? tc(`country.${s.country}`) : ""}${s.code ? ` · ${s.code}` : ""}`}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
