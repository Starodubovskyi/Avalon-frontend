import { useFormatter, useTranslations } from "next-intl";
import {
  Anchor,
  AlertTriangle,
  CalendarRange,
  LayoutGrid,
  Lock,
  Map as MapIcon,
  MessageCircle,
  Search,
  Ship,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandSeal } from "@/components/public/brand/BrandSeal";
import { MockBoard } from "./MockBoard";
import { MockMap } from "./MockMap";

const NAV = [LayoutGrid, MapIcon, Ship, CalendarRange, Anchor, MessageCircle, Users];

function MockSidebar() {
  return (
    <div className="bg-sidebar-gradient hidden w-[60px] shrink-0 flex-col items-center gap-1.5 py-3 md:flex">
      <BrandSeal size="xs" className="mb-3" />
      {NAV.map((Icon, i) => (
        <span
          key={i}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            i === 2 ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" : "text-sidebar-muted",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
      ))}
    </div>
  );
}

function MockTopbar() {
  const t = useTranslations("home");
  return (
    <div className="flex h-12 items-center gap-3 border-b bg-card px-3 sm:px-4">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold leading-tight">{t("shot.boardTitle")}</p>
        <p className="truncate text-[10px] text-muted-foreground">{t("shot.boardSub")}</p>
      </div>
      <span className="mx-auto hidden h-8 w-full max-w-[260px] items-center gap-2 rounded-lg bg-muted px-3 text-[11px] text-muted-foreground lg:flex">
        <Search className="h-3.5 w-3.5" aria-hidden /> {t("shot.search")}
      </span>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <span className="hidden items-center gap-1 rounded-full border border-stage-unpaid/30 bg-stage-unpaid/10 px-2 py-0.5 text-[10px] font-semibold text-stage-unpaid sm:flex">
          <AlertTriangle className="h-3 w-3" aria-hidden /> {t("shot.unpaid")}
        </span>
        <span className="flex items-center gap-1 rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 text-[10px] font-semibold text-ok">
          <span className="h-1.5 w-1.5 rounded-full bg-ok motion-safe:animate-pulse" aria-hidden /> {t("shot.ais")}
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">IM</span>
      </div>
    </div>
  );
}

const ARRIVALS = [
  { name: "UGAH CONFIDENCE", to: "Izmail", at: "2026-11-03T23:06:00Z", inHours: 14 },
  { name: "KARANFIL", to: "Brăila", at: "2026-11-04T15:06:00Z", inDays: 1 },
  { name: "AZOV COAST", to: "Tulcea", at: "2026-11-05T15:06:00Z", inDays: 2 },
];

/** "Arriving in 72 h" panel from the overview */
function MockArrivals() {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const format = useFormatter();
  return (
    <div className="hidden rounded-xl border bg-card shadow-card lg:block">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <p className="text-[12px] font-bold">{t("shot.arrivals")}</p>
        <span className="text-[11px] font-medium text-primary">{t("shot.lineup")}</span>
      </div>
      <ul className="divide-y">
        {ARRIVALS.map((a) => (
          <li key={a.name} className="flex items-center gap-2.5 px-3 py-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-stage-expected" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold">{a.name}</span>
              <span className="block truncate text-[10px] text-muted-foreground">
                {tc("stage.expected")} → {a.to}
              </span>
            </span>
            <span className="tabular shrink-0 text-right">
              <span className="block text-[11px] text-foreground/80">
                {format.dateTime(new Date(a.at), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}
              </span>
              <span className="block text-[10px] text-muted-foreground">
                {a.inHours ? t("shot.inHours", { count: a.inHours }) : t("shot.inDays", { count: a.inDays ?? 0 })}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Screenshot" of the portal for the hero, composed from the real UI pieces — CSS only, theme-aware */
export function ProductShot({ className }: { className?: string }) {
  const t = useTranslations("home");
  return (
    <figure className={cn("relative", className)} aria-label={t("shot.label")}>
      <div aria-hidden className="pointer-events-none absolute -inset-x-6 -top-8 bottom-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_50%_30%,hsl(var(--brand-glow)/0.35),transparent_70%)] blur-2xl" />
      <div className="shadow-product relative rounded-[22px] border border-white/10 bg-white/[0.05] p-1.5 backdrop-blur-md sm:p-2">
        <div className="flex h-7 items-center gap-3 px-2 sm:h-8" aria-hidden>
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </span>
          <span className="mx-auto flex h-5 items-center gap-1.5 rounded-md bg-white/[0.07] px-3 text-[10px] text-white/55 sm:text-[11px]">
            <Lock className="h-2.5 w-2.5" aria-hidden /> avalon · ops / vessels
          </span>
          <span className="w-[42px]" />
        </div>
        <div className="overflow-hidden rounded-[16px] bg-background text-left text-foreground ring-1 ring-black/5">
          <div className="flex">
            <MockSidebar />
            <div className="min-w-0 flex-1">
              <MockTopbar />
              <div className="grid gap-3 p-2.5 sm:p-3.5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                <MockBoard />
                <div className="flex min-w-0 flex-col gap-3">
                  <MockMap idPrefix="hero-map" className="min-h-[230px] flex-1" />
                  <MockArrivals />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
