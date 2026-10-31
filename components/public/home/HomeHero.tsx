import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calculator, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn } from "@/components/ops/ui/primitives";
import { PORT_GUIDE } from "@/lib/public/portGuide";
import { isDemoAvailable } from "@/lib/demo/mode";

const STATS = [
  { value: String(PORT_GUIDE.length), label: "Danube ports" },
  { value: "3", label: "countries, one agent" },
  { value: "7.32 m", label: "Sulina max draught" },
];

const glassBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20";

export function HomeHero() {
  return (
    <section className="px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative isolate mx-auto max-w-[1440px] overflow-hidden rounded-[28px] bg-sidebar shadow-elevated">
        <Image
          src="/brand/hero-sea.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-[65%_50%]"
        />
        <div aria-hidden className="hero-overlay absolute inset-0 -z-10" />
        <div aria-hidden className="noise-overlay -z-10" />

        <div className="px-5 pb-8 pt-12 sm:px-10 sm:pb-12 sm:pt-20 lg:px-16 lg:pb-16 lg:pt-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-stage-roads" aria-hidden />
            Port agency · Sulina → Danube
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-[38px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[68px]">
            Your agent from the Sulina roads to the berth.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Avalon Shipping handles port calls at Izmail, Reni, Orlivka, Giurgiulești, Galați, Brăila and Tulcea — with a live
            vessel board you can follow from anywhere.
          </p>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <Link href="/request" className={cn(btn.primary, "h-11 px-5")}>
              Request agency <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/estimate" className={glassBtn}>
              <Calculator className="h-4 w-4" aria-hidden /> Estimate PDA
            </Link>
            {isDemoAvailable() ? (
              <Link href="/auth" className={cn(glassBtn, "border-transparent bg-transparent hover:bg-white/10")}>
                <PlayCircle className="h-4 w-4" aria-hidden /> Explore the demo
              </Link>
            ) : null}
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-2 sm:mt-16 sm:gap-3">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-3 backdrop-blur-md sm:px-4">
                <dt className="sr-only">{s.label}</dt>
                <dd className="tabular whitespace-nowrap font-display text-xl font-extrabold text-white sm:text-3xl">{s.value}</dd>
                <dd className="mt-0.5 text-[11px] leading-snug text-white/70 sm:text-xs">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
