import { ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn } from "@/components/ops/ui/primitives";
import {
  PDA_GROUP_LABEL,
  fmtEur,
  requestQueryFromEstimate,
  type PdaEstimate,
  type PdaGroup,
} from "@/lib/public/pdaTariffs";
import { CONDITION_LABEL, DESTINATION_LABEL, TYPE_LABEL } from "@/lib/vessels/types";
import { RequestLink } from "../RequestLink";

const GROUP_ORDER: PdaGroup[] = ["channel", "port", "services", "agency"];

export function EstimateTotal({ estimate }: { estimate: PdaEstimate }) {
  const { input, total } = estimate;
  return (
    <div className="bg-sidebar-gradient relative overflow-hidden rounded-[24px] p-6 text-sidebar-foreground shadow-elevated sm:p-7">
      <div aria-hidden className="noise-overlay" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-muted">Indicative total</p>
        <p className="tabular mt-1 font-display text-[44px] font-extrabold leading-none text-white sm:text-5xl" aria-live="polite">
          {fmtEur(total)}
        </p>
        <p className="mt-3 text-sm text-sidebar-foreground/80">
          {TYPE_LABEL[input.vesselType]} · {input.gt.toLocaleString("en-GB")} GT · {input.loa} m · {DESTINATION_LABEL[input.port]} ·{" "}
          {input.days} {input.days === 1 ? "day" : "days"} · {CONDITION_LABEL[input.condition].toLowerCase()}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <RequestLink query={requestQueryFromEstimate(estimate)} className={cn(btn.primary, "h-11 bg-white px-5 text-sidebar hover:brightness-95")}>
            Request a firm PDA <ArrowRight className="h-4 w-4" aria-hidden />
          </RequestLink>
          <p className="text-xs text-sidebar-muted sm:ml-2">An agent replies with current tariffs.</p>
        </div>
      </div>
    </div>
  );
}

export function EstimateBreakdown({ estimate }: { estimate: PdaEstimate }) {
  const groups = GROUP_ORDER.map((g) => ({
    id: g,
    lines: estimate.lines.filter((l) => l.group === g),
  })).filter((g) => g.lines.length > 0);

  return (
    <section className="rounded-2xl border bg-card shadow-card" aria-labelledby="pda-lines">
      <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <h2 id="pda-lines" className="text-[15px] font-semibold">
          Itemised estimate
        </h2>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">EUR · indicative</span>
      </header>

      <div className="divide-y">
        {groups.map((g) => {
          const subtotal = g.lines.reduce((s, l) => s + l.amount, 0);
          return (
            <div key={g.id} className="px-5 py-4">
              <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span>{PDA_GROUP_LABEL[g.id]}</span>
                <span className="tabular">{fmtEur(subtotal)}</span>
              </div>
              <ul className="space-y-2.5">
                {g.lines.map((l) => (
                  <li key={l.id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{l.label}</p>
                      <p className="tabular text-xs text-muted-foreground">{l.basis}</p>
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
        <span className="font-semibold">Total</span>
        <span className="tabular font-display text-xl font-extrabold">{fmtEur(estimate.total)}</span>
      </footer>
      <p className="flex items-start gap-2 px-5 pb-5 pt-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Excludes cargo-related charges, stevedoring, shifting, overtime, bunkers and VAT where applicable. Rates change with port tariffs and
        exchange rates.
      </p>
    </section>
  );
}
