import Link from "next/link";
import { PORT_GUIDE } from "@/lib/public/portGuide";
import { BrandLockup } from "@/components/public/brand/BrandSeal";
import { DanubeArt } from "@/components/public/brand/DanubeArt";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";
import { BoardGlimpse } from "./BoardGlimpse";

const FACTS = [
  { value: String(PORT_GUIDE.length), label: "river ports" },
  { value: "3", label: "countries, one agent" },
  { value: "7.32 m", label: "Sulina max draught" },
];

function Headline({ className }: { className?: string }) {
  return (
    <h1 className={className}>
      Every call on the Danube, <span className="text-brand-gradient">on one live board.</span>
    </h1>
  );
}

/** Desktop: navy brand panel with the river route, a slice of the board and plain facts — no stock photo */
export function AuthBrandPanel() {
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
            aria-label="Avalon Shipping — website"
          >
            <BrandLockup size="md" inverted tagline="Shipping · Operations" priority />
          </Link>
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
            Sulina · Danube · Black Sea
          </span>
        </header>

        <div className="flex min-h-[140px] flex-1 items-center py-6">
          <DanubeArt id="auth-panel" labels className="h-full max-h-[300px]" />
        </div>

        <div className="max-w-[560px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[hsl(var(--brand-accent))]">Operations portal</p>
          <Headline className="mt-3 font-display text-[40px] font-extrabold leading-[1.06] tracking-[-0.025em] xl:text-[46px]" />
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
            Vessels, checklists, documents and the team chat for Avalon Shipping — from the Sulina roads to the berth.
          </p>
          <div className="mt-7">
            <BoardGlimpse />
          </div>
          <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
            {FACTS.map((f) => (
              <div key={f.label}>
                <dt className="sr-only">{f.label}</dt>
                <dd className="tabular font-display text-2xl font-extrabold text-white">{f.value}</dd>
                <dd className="mt-0.5 text-xs text-white/55">{f.label}</dd>
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
        <Link href="/" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50" aria-label="Avalon Shipping — website">
          <BrandLockup size="md" inverted tagline="Operations portal" priority />
        </Link>
        <PublicThemeToggle className="text-white/80 hover:bg-white/10 hover:text-white" />
      </div>
      <Headline className="relative mt-9 max-w-sm font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-4xl" />
      <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-white/65">From the Sulina roads to the berth — vessels, checklists and the team.</p>
    </div>
  );
}
