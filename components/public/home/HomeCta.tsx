import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Calculator, LogIn, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn } from "@/components/ops/ui/primitives";
import { isDemoAvailable } from "@/lib/demo/mode";
import { BrandSeal } from "../brand/BrandSeal";

export function HomeCta() {
  const t = useTranslations("home");
  // NEXT_PUBLIC_DEMO_MODE=off: no demo entry on /auth, so don't promise one here
  const demo = isDemoAvailable();
  return (
    <section className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-[28px] border bg-card px-6 py-12 shadow-elevated sm:px-12 sm:py-16">
        <div className="surface-grid" aria-hidden />
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-[hsl(var(--brand-accent)/0.12)] blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <BrandSeal size="lg" label="Avalon Shipping" />
          <h2 className="mt-6 max-w-2xl text-balance font-display text-[32px] font-extrabold leading-[1.06] tracking-[-0.035em] sm:text-5xl">
            {t("cta.title")}
          </h2>
          <p className="mt-4 max-w-xl text-balance text-[15px] leading-relaxed text-muted-foreground sm:text-base">{t("cta.text")}</p>
          <div className="mt-8 flex w-full flex-col justify-center gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link href="/request" className={cn(btn.primary, "group h-12 px-6 text-[15px]")}>
              {t("cta.request")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link href="/estimate" className={cn(btn.secondary, "h-12 px-6 text-[15px]")}>
              <Calculator className="h-4 w-4" aria-hidden /> {t("cta.estimate")}
            </Link>
            <Link href="/auth" className={cn(btn.secondary, "h-12 px-6 text-[15px]")}>
              <LogIn className="h-4 w-4" aria-hidden /> {t("cta.login")}
            </Link>
            {demo ? (
              <Link href="/auth" className={cn(btn.ghost, "h-12 px-5 text-[15px] text-primary hover:text-primary")}>
                <PlayCircle className="h-4 w-4" aria-hidden /> {t("cta.demo")}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
