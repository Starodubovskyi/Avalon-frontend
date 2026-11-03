import Link from "next/link";
import { COUNTRY_LABEL, PORT_GUIDE, SULINA_CHANNEL } from "@/lib/public/portGuide";

const STATS = [
  { value: String(PORT_GUIDE.length + 1), label: "Sulina channel + river ports", sub: "From the roads to Brăila" },
  { value: "3", label: "Countries, one agent", sub: "Romania · Ukraine · Moldova" },
  { value: "7.32 m", label: "Sulina max draught", sub: "Indicative, 24 ft" },
  { value: "≈ 64 km", label: "Sulina channel", sub: "Sulina → Tulcea fork" },
];

const CHIPS = [
  { id: "sulina", name: "Sulina", meta: `${SULINA_CHANNEL.unlocode} · RO` },
  ...PORT_GUIDE.map((p) => ({ id: p.id.toLowerCase(), name: p.name, meta: `${p.unlocode ?? COUNTRY_LABEL[p.country]} · ${p.country}` })),
];

/** Plain facts and the ports covered, as a calm strip under the hero */
export function HomeTrust() {
  return (
    <section aria-label="Coverage in numbers" className="px-4 pb-6 pt-14 sm:px-6 sm:pt-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4 lg:gap-0 lg:divide-x">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col lg:px-8 lg:first:pl-0">
              <dt className="mt-2 text-sm font-semibold text-foreground">{s.label}</dt>
              <dd className="tabular -order-1 font-display text-[34px] font-extrabold leading-none tracking-[-0.02em] text-foreground sm:text-[44px]">
                {s.value}
              </dd>
              <dd className="mt-1 text-xs text-muted-foreground">{s.sub}</dd>
            </div>
          ))}
        </dl>

        <div className="marquee-mask relative mt-12 overflow-hidden">
          <ul className="marquee-track gap-3">
            {[0, 1].map((copy) =>
              CHIPS.map((c) => (
                <li key={`${copy}-${c.id}`} aria-hidden={copy === 1 || undefined} className="shrink-0">
                  <Link
                    href={`/port-guide#${c.id}`}
                    tabIndex={copy === 1 ? -1 : undefined}
                    className="flex h-11 items-center gap-2.5 rounded-full border bg-card px-4 text-sm font-semibold shadow-card transition hover:border-primary/40 hover:text-primary"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                    {c.name}
                    <span className="tabular text-xs font-medium text-muted-foreground">{c.meta}</span>
                  </Link>
                </li>
              )),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
