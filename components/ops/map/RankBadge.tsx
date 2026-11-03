import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtRank } from "@/lib/points/team-points";

const SIZE = {
  md: { box: "gap-1 px-2.5 py-1 text-[11px]", icon: "h-3.5 w-3.5" },
  sm: { box: "gap-0.5 px-1.5 py-0.5 text-[10px]", icon: "h-3 w-3" },
} as const;

/** Gold "RANK 980" pill: the rank of the person who added the point; `label={false}` keeps just trophy + number for tight rows */
export function RankBadge({
  rank,
  size = "md",
  label = true,
  className,
}: {
  rank: number;
  size?: keyof typeof SIZE;
  label?: boolean;
  className?: string;
}) {
  const s = SIZE[size];
  return (
    <span
      title="Rank of the person who added the point: points, logos, posts, comments and requests"
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 font-extrabold tabular-nums tracking-[0.08em] text-amber-950",
        size === "md" && "shadow-[0_6px_16px_-6px_rgba(245,158,11,0.8)]",
        s.box,
        className,
      )}
    >
      <Trophy className={s.icon} aria-hidden />
      {label ? "RANK " : <span className="sr-only">Rank </span>}
      {fmtRank(rank)}
    </span>
  );
}
