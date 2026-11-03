/**
 * Shared button looks — plain class strings so links and buttons stay native elements.
 * Depth comes from a top sheen and layered shadows; pressing moves the button down a pixel.
 */
const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap text-sm transition-[background-color,border-color,color,box-shadow,filter,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

export const btn = {
  primary: `${base} h-10 rounded-xl bg-primary bg-[linear-gradient(180deg,hsl(0_0%_100%/0.16),hsl(0_0%_100%/0)_60%)] px-4 font-semibold text-primary-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.2),inset_0_-1px_0_hsl(0_0%_0%/0.1),0_1px_2px_hsl(var(--primary-strong)/0.3),0_6px_16px_-6px_hsl(var(--primary)/0.55)] hover:brightness-[1.07] active:translate-y-px active:brightness-95 active:shadow-[inset_0_1px_2px_hsl(0_0%_0%/0.15)]`,
  secondary: `${base} h-10 rounded-xl border border-border bg-card px-4 font-medium text-foreground shadow-card hover:border-border-strong hover:bg-surface active:translate-y-px active:bg-muted`,
  ghost: `${base} h-9 gap-1.5 rounded-lg px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground active:bg-accent`,
  danger: `${base} h-10 rounded-xl border border-bad/30 bg-card px-4 font-medium text-bad shadow-card hover:border-bad/45 hover:bg-bad/[0.06] active:translate-y-px active:bg-bad/10`,
  icon: `${base} h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 disabled:opacity-40`,
  /** quiet filled button for toolbars and secondary actions on cards */
  soft: `${base} h-10 rounded-xl bg-primary/10 px-4 font-semibold text-primary hover:bg-primary/15 active:translate-y-px`,
};
