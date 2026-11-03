import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

/** Public pages scroll inside this box: the root layout pins <body> to the viewport for the app shell */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-background">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}

export function PublicSectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  inverted = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  inverted?: boolean;
}) {
  return (
    <div className={cn("reveal", align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl")}>
      <p
        className={cn(
          "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]",
          inverted ? "text-[hsl(var(--brand-accent))]" : "text-primary",
        )}
      >
        <span aria-hidden className={cn("h-px w-6", inverted ? "bg-[hsl(var(--brand-accent))]" : "bg-primary")} />
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-3 font-display text-[30px] font-extrabold leading-[1.08] tracking-[-0.025em] sm:text-[44px]",
          inverted && "text-white",
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className={cn("mt-4 max-w-2xl text-[15px] leading-relaxed sm:text-base", align === "center" && "mx-auto", inverted ? "text-white/65" : "text-muted-foreground")}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/** Compact page intro for inner public pages */
export function PublicPageIntro({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b bg-card">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-stage-roads/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl font-display text-[32px] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}
