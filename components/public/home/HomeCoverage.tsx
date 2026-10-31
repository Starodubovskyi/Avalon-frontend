import Link from "next/link";
import { ArrowRight, Calculator, CheckCircle2, FileText, Map, MessageCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn } from "@/components/ops/ui/primitives";
import { COUNTRY_LABEL, PORT_GUIDE, SULINA_CHANNEL } from "@/lib/public/portGuide";
import { isDemoAvailable } from "@/lib/demo/mode";
import { PublicSectionHeader } from "../PublicShell";

/** Upstream order from the sea, as a vessel meets them */
const ROUTE = ["TULCEA", "IZMAIL", "ORLIVKA", "RENI", "GIURGIULESTI", "GALATI", "BRAILA"] as const;

const STOPS = [
  { id: "sulina", name: "Sulina", sub: `Channel · ${SULINA_CHANNEL.unlocode}`, href: "/port-guide#sulina", sea: true },
  ...ROUTE.map((id) => {
    const p = PORT_GUIDE.find((g) => g.id === id);
    return {
      id: id.toLowerCase(),
      name: p?.name ?? id,
      sub: `${p ? COUNTRY_LABEL[p.country] : ""}${p?.unlocode ? ` · ${p.unlocode}` : ""}`,
      href: `/port-guide#${id.toLowerCase()}`,
      sea: false,
    };
  }),
];

const PORTAL = [
  { icon: Map, text: "Your vessel on the live fleet map, from the roads to the berth" },
  { icon: CheckCircle2, text: "Status board: expected, at Sulina roads, in port, departed" },
  { icon: FileText, text: "Requests, quotes and the agent's notes in one place" },
  { icon: MessageCircle, text: "Chat with the Avalon team instead of long email threads" },
];

export function HomeCoverage() {
  return (
    <section className="px-3 sm:px-4">
      <div className="bg-sidebar-gradient relative mx-auto max-w-[1440px] overflow-hidden rounded-[28px] px-5 py-14 text-sidebar-foreground sm:px-10 sm:py-20 lg:px-16">
        <div aria-hidden className="noise-overlay" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <PublicSectionHeader
            inverted
            eyebrow="Coverage"
            title="Sulina channel and seven river ports"
            subtitle="Romania, Ukraine and Moldova — one agent across three borders on the Lower Danube."
          />
          <Link
            href="/port-guide"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Open the port guide <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ol className="relative mt-12 grid gap-0 sm:grid-cols-2 sm:gap-x-8 xl:grid-cols-8 xl:gap-2">
          {STOPS.map((s, i) => (
            <li key={s.id} className="relative flex gap-4 pb-6 last:pb-0 sm:pb-6 xl:flex-col xl:gap-3 xl:pb-0">
              {i < STOPS.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[11px] top-6 h-full w-0.5 bg-gradient-to-b from-stage-roads/70 to-primary/50 sm:hidden xl:left-6 xl:top-[11px] xl:block xl:h-0.5 xl:w-full xl:bg-gradient-to-r"
                />
              ) : null}
              <span
                className={cn(
                  "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white/10",
                  s.sea ? "bg-stage-roads" : "bg-primary",
                )}
              >
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
              <Link href={s.href} className="group -mt-1 min-h-[40px] xl:mt-0">
                <span className="block font-display text-[17px] font-bold text-white transition group-hover:text-stage-roads xl:text-[15px]">{s.name}</span>
                <span className="block text-xs text-sidebar-muted">{s.sub}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function HomePortal() {
  // NEXT_PUBLIC_DEMO_MODE=off: no demo entry on /auth, so don't promise one here
  const demo = isDemoAvailable();
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div>
          <PublicSectionHeader
            eyebrow="Client portal"
            title="Follow your call without chasing emails"
            subtitle={
              demo
                ? "Clients sign in to a read-only view of the Avalon board. Try it with demo data — no account needed."
                : "Clients sign in to a read-only view of the Avalon board. Owners and partners can register a viewer account."
            }
          />
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            {demo ? (
              <Link href="/auth" className={cn(btn.primary, "h-11 px-5")}>
                <PlayCircle className="h-4 w-4" aria-hidden /> Explore the demo
              </Link>
            ) : null}
            <Link href="/auth" className={cn(demo ? btn.secondary : btn.primary, "h-11 px-5")}>
              Client login
            </Link>
          </div>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PORTAL.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-card">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="text-sm leading-relaxed text-foreground/85">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HomeCta() {
  return (
    <section className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border bg-card px-6 py-10 shadow-elevated sm:px-12 sm:py-14">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-stage-roads/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Next call on the Danube?</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Send the nomination in two minutes, or check the indicative costs first.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link href="/request" className={cn(btn.primary, "h-12 px-6 text-[15px]")}>
              Request agency <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/estimate" className={cn(btn.secondary, "h-12 px-6 text-[15px]")}>
              <Calculator className="h-4 w-4" aria-hidden /> Estimate PDA
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
