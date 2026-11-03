import Image from "next/image";
import { cn } from "@/lib/utils";

type SealSize = "xs" | "sm" | "md" | "lg" | "xl";

const BOX: Record<SealSize, string> = {
  xs: "h-7 w-7 p-[2px]",
  sm: "h-10 w-10 p-[3px]",
  md: "h-12 w-12 p-[3px]",
  lg: "h-16 w-16 p-1",
  xl: "h-20 w-20 p-1",
};

const SIZES: Record<SealSize, string> = { xs: "28px", sm: "40px", md: "48px", lg: "64px", xl: "80px" };

/** Square exports of public/brand/avalon-mark.png (12 KB / 67 KB instead of the 211 KB original) */
const SRC: Record<SealSize, string> = {
  xs: "/brand/avalon-icon-192.png",
  sm: "/brand/avalon-icon-192.png",
  md: "/brand/avalon-icon-192.png",
  lg: "/brand/avalon-icon-512.png",
  xl: "/brand/avalon-icon-512.png",
};

/**
 * The round "AVALON SHIPPING LTD." mark on a white disc: it always sits on its own seal
 * and reads the same on light, dark and navy surfaces.
 */
export function BrandSeal({
  size = "sm",
  label,
  glow = false,
  priority = false,
  className,
}: {
  size?: SealSize;
  /** accessible name; omit when a visible wordmark sits next to the seal */
  label?: string;
  /** soft halo for navy surfaces */
  glow?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-white",
        glow
          ? "shadow-[0_0_0_5px_rgba(255,255,255,0.08),0_10px_30px_-8px_hsl(var(--brand-glow)/0.85)]"
          : "shadow-[0_0_0_1px_hsl(var(--border)),0_4px_14px_-6px_hsl(var(--brand-navy)/0.55)]",
        BOX[size],
        className,
      )}
    >
      <span className="relative block h-full w-full overflow-hidden rounded-full">
        <Image
          src={SRC[size]}
          alt={label ?? ""}
          fill
          sizes={SIZES[size]}
          priority={priority}
          className="object-contain"
        />
      </span>
    </span>
  );
}

/** Seal + "AVALON / SHIPPING" wordmark */
export function BrandLockup({
  size = "sm",
  tagline = "Shipping",
  inverted = false,
  priority = false,
  className,
}: {
  size?: SealSize;
  tagline?: string;
  inverted?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <BrandSeal size={size} glow={inverted} priority={priority} />
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display font-extrabold tracking-[0.08em]",
            size === "lg" || size === "xl" ? "text-lg" : "text-[15px]",
            inverted ? "text-white" : "text-foreground",
          )}
        >
          AVALON
        </span>
        <span
          className={cn(
            "block text-[10px] font-semibold uppercase tracking-[0.26em]",
            inverted ? "text-white/60" : "text-muted-foreground",
          )}
        >
          {tagline}
        </span>
      </span>
    </span>
  );
}
