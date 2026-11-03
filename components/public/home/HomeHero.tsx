import Link from "next/link";
import { ArrowRight, Calculator, LogIn, PlayCircle } from "lucide-react";
import { isDemoAvailable } from "@/lib/demo/mode";
import { ProductShot } from "./shot/ProductShot";

const heroBtn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--brand-deep))]";

export function HomeHero() {
  const demo = isDemoAvailable();
  return (
    <section className="px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="brand-surface relative isolate mx-auto max-w-[1440px] overflow-hidden rounded-[28px] text-white sm:rounded-[32px]">
        <div className="brand-aurora" aria-hidden />
        <div className="brand-grid" aria-hidden />
        <div className="noise-overlay" aria-hidden />

        <div className="relative px-5 pt-14 sm:px-10 sm:pt-20 lg:px-16 lg:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="hero-rise inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-[hsl(var(--brand-accent))] motion-safe:animate-ping" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-accent))]" />
              </span>
              Port agency · Sulina → Danube
            </p>
            <h1 className="hero-rise mt-6 font-display text-[40px] font-extrabold leading-[1.04] tracking-[-0.03em] [animation-delay:80ms] sm:text-6xl lg:text-[76px]">
              Your agent from the Sulina roads <span className="text-brand-gradient">to the berth.</span>
            </h1>
            <p className="hero-rise mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 [animation-delay:160ms] sm:text-lg">
              Port calls at Izmail, Reni, Orlivka, Giurgiulești, Galați, Brăila and Tulcea — with a live vessel board your team and
              owners can follow from anywhere.
            </p>

            <div className="hero-rise mt-9 flex flex-col justify-center gap-2.5 [animation-delay:240ms] sm:flex-row">
              <Link
                href="/request"
                className={`${heroBtn} group bg-white text-[hsl(var(--brand-deep))] shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)] hover:bg-white/90`}
              >
                Request agency <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link href="/estimate" className={`${heroBtn} border border-white/15 bg-white/[0.08] backdrop-blur-md hover:bg-white/[0.14]`}>
                <Calculator className="h-4 w-4" aria-hidden /> Estimate PDA
              </Link>
              {demo ? (
                <Link href="/auth" className={`${heroBtn} text-white/85 hover:bg-white/[0.08] hover:text-white`}>
                  <PlayCircle className="h-4 w-4" aria-hidden /> Explore the demo
                </Link>
              ) : (
                <Link href="/auth" className={`${heroBtn} text-white/85 hover:bg-white/[0.08] hover:text-white`}>
                  <LogIn className="h-4 w-4" aria-hidden /> Client login
                </Link>
              )}
            </div>
            <p className="hero-rise mt-5 text-xs text-white/45 [animation-delay:300ms]">Romania · Ukraine · Moldova — one agent across three borders</p>
          </div>

          <ProductShot className="hero-rise mx-auto -mb-24 mt-14 max-w-[1180px] [animation-delay:380ms] sm:-mb-20 sm:mt-16" />
        </div>
        {/* the frame slides under the section edge; a soft fade finishes it */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(var(--brand-deep))] to-transparent" />
      </div>
    </section>
  );
}
