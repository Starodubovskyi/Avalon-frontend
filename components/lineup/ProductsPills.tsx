"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Droplet,
  Sprout,
  Leaf,
  FlaskConical,
  Flame,
  Keyboard,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Item = {
  label: string;
  href: string;
  desc: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  glowFrom: string;
  glowVia?: string;
  glowTo: string;
  hotkey: string;
};

const items: Item[] = [
  {
    label: "Liuid",
    href: "/lineup/product/liquid",
    desc: "Refined liquids & clean petroleum products",
    Icon: Droplet,
    glowFrom: "from-sky-400/40",
    glowVia: "via-cyan-400/35",
    glowTo: "to-emerald-400/40",
    hotkey: "1",
  },
  {
    label: "Agri",
    href: "/lineup/product/agri",
    desc: "Grains, oilseeds, sugar & feed",
    Icon: Sprout,
    glowFrom: "from-lime-300/40",
    glowVia: "via-emerald-400/35",
    glowTo: "to-teal-400/40",
    hotkey: "2",
  },
  {
    label: "Feartizers",
    href: "/lineup/product/fertilizers",
    desc: "Dry & liquid fertilizers (urea, NPK, etc.)",
    Icon: Leaf,
    glowFrom: "from-amber-300/40",
    glowVia: "via-lime-300/35",
    glowTo: "to-emerald-400/40",
    hotkey: "3",
  },
  {
    label: "Chemicals",
    href: "/lineup/product/chemicals",
    desc: "Basic & specialty chemicals",
    Icon: FlaskConical,
    glowFrom: "from-fuchsia-400/35",
    glowVia: "via-purple-400/30",
    glowTo: "to-sky-400/35",
    hotkey: "4",
  },
  {
    label: "Crude",
    href: "/lineup/product/crude",
    desc: "Crude oil grades & blends",
    Icon: Flame,
    glowFrom: "from-orange-400/40",
    glowVia: "via-amber-400/35",
    glowTo: "to-yellow-300/40",
    hotkey: "5",
  },
];

const base =
  "relative group inline-flex items-center gap-3 rounded-full border border-white/25 " +
  "bg-white/10 px-8 py-4 text-lg md:text-xl font-semibold text-white " +
  "backdrop-blur-xl shadow-2xl transition " +
  "hover:scale-[1.02] hover:border-white/35 " +
  "focus:outline-none focus:ring-4 focus:ring-emerald-300/30";

function FancyPill({ item }: { item: Item }) {
  const { label, href, Icon, glowFrom, glowVia, glowTo, desc } = item;

  return (
    <Tooltip delayDuration={120}>
      <TooltipTrigger asChild>
        <Link href={href} aria-label={label} className={base}>
          <span
            aria-hidden
            className={[
              "pointer-events-none absolute -inset-2 -z-10 rounded-full blur-2xl opacity-0",
              "transition duration-300 group-hover:opacity-100",
              "bg-gradient-to-r",
              glowFrom,
              glowVia ?? "",
              glowTo,
            ].join(" ")}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-white/0 transition group-hover:bg-white/5"
          />
          <Icon className="h-6 w-6 md:h-7 md:w-7 opacity-90" />
          <span>{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[240px] text-sm leading-snug">
        {desc}
      </TooltipContent>
    </Tooltip>
  );
}

function KbdLegend() {
  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
      <Keyboard className="h-4 w-4" />
      <span>Press</span>
      <kbd className="rounded bg-white/10 px-1.5 py-0.5">1</kbd>
      <kbd className="rounded bg-white/10 px-1.5 py-0.5">2</kbd>
      <kbd className="rounded bg-white/10 px-1.5 py-0.5">3</kbd>
      <kbd className="rounded bg-white/10 px-1.5 py-0.5">4</kbd>
      <kbd className="rounded bg-white/10 px-1.5 py-0.5">5</kbd>
      <span>to quickly open categories</span>
    </div>
  );
}

export default function ProductsPills() {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const item = items.find((i) => i.hotkey === e.key);
      if (item) {
        e.preventDefault();
        router.push(item.href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <TooltipProvider>
      <div className="mt-4 flex w-full max-w-6xl flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {items.map((it) => (
            <FancyPill key={it.href} item={it} />
          ))}
        </div>
        <KbdLegend />
      </div>
    </TooltipProvider>
  );
}
