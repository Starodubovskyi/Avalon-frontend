import Link from "next/link";
import { Layers, ChevronRight } from "lucide-react";

export default function HeroTitle() {
  const heroBtn =
    "group inline-flex items-center justify-center gap-4 rounded-full " +
    "h-16 md:h-20 min-w-[300px] md:min-w-[360px] px-10 md:px-12 " +
    "text-2xl md:text-4xl font-black tracking-tight " +
    "text-white border border-white/30 bg-white/10 backdrop-blur-xl " +
    "shadow-[0_14px_48px_rgba(0,0,0,0.5)] transition " +
    "hover:bg-white/15 hover:border-white/40 hover:scale-[1.025] " +
    "focus:outline-none focus:ring-4 focus:ring-white/40 active:scale-[0.99]";

  return (
    <Link
      href="/cargoes"
      className="relative inline-block"
      aria-label="Open All Cargoes"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full
                   bg-gradient-to-br from-emerald-400/60 via-cyan-400/50 to-sky-400/60
                   blur-[40px]"
      />
      <span className={heroBtn}>
        <Layers className="h-8 w-8 md:h-10 md:w-10 opacity-90" />
        <span>All Cargoes</span>
        <ChevronRight className="h-8 w-8 md:h-10 md:w-10 translate-x-0 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
