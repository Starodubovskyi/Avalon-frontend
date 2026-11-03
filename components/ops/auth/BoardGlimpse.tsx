import { Anchor, CircleDot, Clock3, Container, Fuel, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChecklistChip } from "@/components/public/brand/ChecklistChip";

/** Stage pills tuned for the navy panel (the board's own tokens are for light and dark cards) */
const STAGE = {
  expected: { label: "Expected", icon: Clock3, cls: "bg-amber-300/15 text-amber-200" },
  roads: { label: "At Sulina roads", icon: Anchor, cls: "bg-cyan-300/15 text-cyan-200" },
  port: { label: "In port", icon: CircleDot, cls: "bg-sky-300/15 text-sky-200" },
} as const;

type Stage = keyof typeof STAGE;

const ROWS: { name: string; route: string; stage: Stage; icon: LucideIcon }[] = [
  { name: "KEREMCAN", route: "Sulina roads → Reni", stage: "roads", icon: Container },
  { name: "JANEX", route: "Berth 4 · Giurgiulești", stage: "port", icon: Fuel },
];

const CHECKLIST = ["PRE IN", "MSW IN", "T1", "PILOT", "PDA", "PAID"];

function StagePill({ stage }: { stage: Stage }) {
  const s = STAGE[stage];
  const Icon = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold", s.cls)}>
      <Icon className="h-3 w-3" aria-hidden />
      {s.label}
    </span>
  );
}

/** Illustrative slice of the vessels board for the sign-in brand panel */
export function BoardGlimpse() {
  return (
    <figure
      aria-label="Illustration: a vessel's checklist turning green on the board"
      className="on-navy overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-[hsl(var(--brand-accent))] motion-safe:animate-ping" />
            <span className="relative h-2 w-2 rounded-full bg-[hsl(var(--brand-accent))]" />
          </span>
          Vessels board
        </p>
        <p className="text-[11px] text-white/50">Live · every change signed</p>
      </div>

      <div className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-300/15 text-amber-200">
            <Container className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">SEA GLORY</p>
            <p className="truncate text-xs text-white/55">General cargo · ETA Sulina 04:30 → Reni</p>
          </div>
          <StagePill stage="expected" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CHECKLIST.map((c, i) => (
            <ChecklistChip key={c} label={c} done flip index={i} />
          ))}
        </div>
      </div>

      {/* the extra rows only where the panel has the height for them */}
      <ul className="hidden divide-y divide-white/[0.07] border-t border-white/10 [@media(min-height:1000px)]:block">
        {ROWS.map((r) => {
          const Icon = r.icon;
          return (
            <li key={r.name} className="flex items-center gap-3 px-4 py-2.5">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", STAGE[r.stage].cls)}>
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-white/90">{r.name}</p>
                <p className="truncate text-[11px] text-white/45">{r.route}</p>
              </div>
              <StagePill stage={r.stage} />
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
