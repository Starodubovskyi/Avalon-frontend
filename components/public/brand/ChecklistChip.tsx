import { cn } from "@/lib/utils";

/** Static class names for staggered flips (Tailwind needs literal strings) */
const FLIP_DELAYS = [
  "[animation-delay:0s]",
  "[animation-delay:0.7s]",
  "[animation-delay:1.4s]",
  "[animation-delay:2.1s]",
  "[animation-delay:2.8s]",
  "[animation-delay:3.5s]",
];

/**
 * Board checklist pill as on the vessels board: red until done, green after.
 * `flip` loops it red → green (staggered by `index`); with reduced motion it rests in its `done` state.
 */
export function ChecklistChip({
  label,
  done,
  flip = false,
  index = 0,
  className,
}: {
  label: string;
  done: boolean;
  flip?: boolean;
  index?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-[3px] text-[10px] font-bold tracking-wide",
        done ? "chip-ok" : "chip-bad",
        flip && cn("chip-flip", FLIP_DELAYS[index % FLIP_DELAYS.length]),
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
