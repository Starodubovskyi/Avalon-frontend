import Link from "next/link";
import { useTranslations } from "next-intl";
import { PORT_GUIDE } from "@/lib/public/portGuide";
import { BrandLockup } from "@/components/public/brand/BrandSeal";
import { DanubeArt } from "@/components/public/brand/DanubeArt";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { BoardGlimpse } from "./BoardGlimpse";

const FACTS = [
  { value: String(PORT_GUIDE.length), key: "ports" },
  { value: "3", key: "countries" },
  { value: null, key: "draught" },
] as const;

function Headline({ className }: { className?: string }) {
  const t = useTranslations("auth");
  return (
    <h1 className={className}>
      {t("brand.headline")} <span className="text-brand-gradient">{t("brand.headlineAccent")}</span>
    </h1>
  );
}

/** Desktop: navy brand panel with the river route, a slice of the board and plain facts — no stock photo */
export function AuthBrandPanel() {
  const t = useTranslations("auth");
  return (
    <section className="brand-surface relative m-3 hidden min-h-[calc(100svh-24px)] overflow-hidden rounded-[28px] text-white lg:flex lg:flex-col">
      <div className="brand-aurora" aria-hidden />
      <div className="brand-grid" aria-hidden />
      <div className="noise-overlay" aria-hidden />

      <div className="relative z-10 flex flex-1 flex-col px-10 pb-10 pt-9 xl:px-12">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
            aria-label={t("brand.homeLabel")}
          >
            <BrandLockup size="md" inverted tagline={t("brand.tagline")} priority />
          </Link>
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            {t("brand.route")}
          </span>
        </header>

        <div className="flex min-h-[140px] flex-1 items-center py-6">
          <DanubeArt id="auth-panel" labels className="h-full max-h-[300px]" />
        </div>

        <div className="max-w-[560px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[hsl(var(--brand-accent))]">{t("brand.eyebrow")}</p>
          <Headline className="mt-3 text-balance font-display text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em] xl:text-[48px]" />
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
            {t("brand.lead")}
          </p>
          <div className="mt-7">
            <BoardGlimpse />
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
            {FACTS.map((f) => (
              <div key={f.key}>
                <dt className="sr-only">{t(`brand.facts.${f.key}`)}</dt>
                <dd className="tabular font-display text-2xl font-extrabold tracking-[-0.02em] text-white">{f.value ?? t("brand.draughtValue")}</dd>
                <dd className="mt-0.5 text-xs text-white/55">{t(`brand.facts.${f.key}`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/** Phone and tablet: compact navy header with the seal on top of the form */
export function AuthMobileHero() {
  const t = useTranslations("auth");
  return (
    <div className="brand-surface relative shrink-0 overflow-hidden px-5 pb-20 pt-[max(1.25rem,env(safe-area-inset-top))] text-white lg:hidden">
      <div className="brand-aurora" aria-hidden />
      <div className="brand-grid" aria-hidden />
      {/* faint, low in the band where the form card overlaps, so it never crosses the headline */}
      <DanubeArt
        id="auth-mobile"
        className="pointer-events-none absolute -bottom-28 left-1/2 w-[150%] max-w-none -translate-x-1/2 opacity-40 sm:-bottom-40 sm:w-[110%]"
      />

      <div className="relative flex items-center justify-between">
        <Link href="/" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50" aria-label={t("brand.homeLabel")}>
          <BrandLockup size="md" inverted tagline={t("brand.eyebrow")} priority />
        </Link>
        <div className="flex items-center gap-0.5">
          <LanguageSwitcher tone="inverted" />
          <PublicThemeToggle className="text-white/80 hover:bg-white/10 hover:text-white" />
        </div>
      </div>
      <Headline className="relative mt-9 max-w-sm text-balance font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-4xl" />
      <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-white/65">{t("brand.leadShort")}</p>
    </div>
  );
}
