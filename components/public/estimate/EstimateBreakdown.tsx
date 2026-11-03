import { useFormatter, useTranslations } from "next-intl";
import { ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn } from "@/components/ops/ui/primitives";
import {
  requestQueryFromEstimate,
  type PdaEstimate,
  type PdaGroup,
} from "@/lib/public/pdaTariffs";
import { DESTINATION_LABEL } from "@/lib/vessels/types";
import { useEur } from "@/lib/public/useEur";
import { RequestLink } from "../RequestLink";

const GROUP_ORDER: PdaGroup[] = ["channel", "port", "services", "agency"];

export function EstimateTotal({ estimate }: { estimate: PdaEstimate }) {
  const t = useTranslations("publicPages");
  const tc = useTranslations("common");
  const format = useFormatter();
  const fmtEur = useEur();
  const { input, total } = estimate;
  return (
    <div className="bg-sidebar-gradient relative overflow-hidden rounded-[24px] p-6 text-sidebar-foreground shadow-elevated sm:p-7">
      <div aria-hidden className="noise-overlay" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted">{t("pda.indicativeTotal")}</p>
        <p className="tabular mt-1 font-display text-[44px] font-extrabold leading-none text-white sm:text-5xl" aria-live="polite">
          {fmtEur(total)}
        </p>
        <p className="mt-3 text-sm text-sidebar-foreground/80">
          {tc(`vesselType.${input.vesselType}`)} · {format.number(input.gt)} GT · {t("guide.metres", { value: input.loa })} · {DESTINATION_LABEL[input.port]} ·{" "}
          {t("pda.days", { count: input.days })} · {tc(`condition.${input.condition}`).toLowerCase()}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <RequestLink query={requestQueryFromEstimate(estimate)} className={cn(btn.primary, "h-11 bg-white px-5 text-sidebar hover:brightness-95")}>
            {t("estimate.requestFirm")} <ArrowRight className="h-4 w-4" aria-hidden />
          </RequestLink>
          <p className="text-xs text-sidebar-muted sm:ml-2">{t("estimate.agentReplies")}</p>
        </div>
      </div>
    </div>
  );
}

export function EstimateBreakdown({ estimate }: { estimate: PdaEstimate }) {
  const t = useTranslations("publicPages");
  const fmtEur = useEur();
  const groups = GROUP_ORDER.map((g) => ({
    id: g,
    lines: estimate.lines.filter((l) => l.group === g),
  })).filter((g) => g.lines.length > 0);

  return (
    <section className="rounded-2xl border bg-card shadow-card" aria-labelledby="pda-lines">
      <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <h2 id="pda-lines" className="font-display text-[15px] font-bold tracking-[-0.01em]">
          {t("estimate.itemised")}
        </h2>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{t("estimate.eurIndicative")}</span>
      </header>

      <div className="divide-y">
        {groups.map((g) => {
          const subtotal = g.lines.reduce((s, l) => s + l.amount, 0);
          return (
            <div key={g.id} className="px-5 py-4">
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span>{t(`pda.groups.${g.id}`)}</span>
                <span className="tabular">{fmtEur(subtotal)}</span>
              </div>
              <ul className="space-y-2.5">
                {g.lines.map((l) => (
                  <li key={l.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t(`pda.lines.${l.labelKey}`, l.args)}</p>
                      <p className="tabular text-xs text-muted-foreground">{t(`pda.basis.${l.basisKey}`, l.args)}</p>
                    </div>
                    <span className="tabular shrink-0 text-sm font-semibold">{fmtEur(l.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <footer className="flex items-center justify-between gap-3 rounded-b-2xl border-t bg-muted/50 px-5 py-4">
        <span className="font-semibold">{t("estimate.total")}</span>
        <span className="tabular font-display text-xl font-extrabold">{fmtEur(estimate.total)}</span>
      </footer>
      <p className="flex items-start gap-2 px-5 pb-5 pt-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        {t("estimate.excludes")}
      </p>
    </section>
  );
}
