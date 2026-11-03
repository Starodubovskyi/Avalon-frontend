"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { daysSince, isUnpaidAfterDeparture } from "@/lib/vessels/status";
import { useVesselFormat, useVesselLabels } from "@/lib/vessels/i18n";
import { userName, type VesselView } from "@/lib/vessels/types";
import { StageBadge, UnpaidBadge } from "../ui/StageBadge";
import { ChecklistRow } from "./ChecklistRow";
import { VesselTypeIcon } from "./VesselTypeIcon";

function Progress({ vessel }: { vessel: VesselView }) {
  const t = useTranslations("vessels.table");
  if (!vessel.checklist) return <span className="text-muted-foreground">—</span>;
  const { done, total } = vessel.checklist;
  const complete = done === total;
  return (
    <div className="flex items-center gap-2" title={t("progressTitle", { done, total })}>
      <div className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn("h-3.5 w-1.5 rounded-full", i < done ? "bg-ok" : "bg-bad/25")} />
        ))}
      </div>
      <span className={cn("tabular text-xs font-semibold", complete ? "text-ok" : "text-muted-foreground")}>
        {done}/{total}
      </span>
    </div>
  );
}

const TH = "whitespace-nowrap border-b px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em]";
const TD = "border-b border-border/70 px-3 py-3.5";

export function VesselTable({ vessels, editable }: { vessels: VesselView[]; editable: boolean }) {
  const t = useTranslations("vessels.table");
  const labels = useVesselLabels();
  const fmt = useVesselFormat();
  const router = useRouter();
  const restricted = vessels.some((v) => v.restricted);

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-10 bg-muted/60 text-left text-muted-foreground backdrop-blur">
          <tr>
            <th className={cn(TH, "sticky left-0 z-20 bg-muted pl-5")}>{t("vessel")}</th>
            <th className={TH}>{t("statusDestination")}</th>
            <th className={TH}>{t("etaSulina")}</th>
            <th className={TH}>{t("arrival")}</th>
            <th className={TH}>{t("inPort")}</th>
            <th className={TH}>{t("departure")}</th>
            {restricted ? null : (
              <>
                <th className={TH}>{t("checklist")}</th>
                <th className={TH}>{t("done")}</th>
                <th className={cn(TH, "hidden 2xl:table-cell")}>{t("lastChange")}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {vessels.map((v) => {
            const unpaid = isUnpaidAfterDeparture(v);
            const departed = v.stage === "departed";
            return (
              <tr
                key={v.id}
                onClick={() => router.push(`/vessels/${v.id}`)}
                title={v.updatedBy ? t("lastChangeTitle", { when: fmt.relative(v.updatedAt), name: userName(v.updatedBy) }) : undefined}
                className={cn(
                  "group cursor-pointer transition-colors hover:bg-accent/40",
                  unpaid && "bg-stage-unpaid/[0.05]",
                  // fade content, not the sticky cell itself, so scrolled columns never show through it
                  departed && !unpaid && "[&_td:first-child>*]:opacity-70 [&_td:not(:first-child)]:opacity-70",
                )}
              >
                <td
                  className={cn(
                    TD,
                    // opaque base + inset tint: a translucent background would let scrolled cells show through
                    "sticky left-0 z-[1] bg-card pl-5 group-hover:shadow-[inset_0_0_0_100vmax_hsl(var(--accent)/0.4)]",
                    unpaid && "shadow-[inset_0_0_0_100vmax_hsl(var(--st-unpaid)/0.05)]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <VesselTypeIcon vessel={v} />
                    <div className="min-w-0">
                      <Link
                        href={`/vessels/${v.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="whitespace-nowrap font-semibold text-foreground transition hover:text-primary focus-visible:underline focus-visible:outline-none"
                      >
                        {v.name}
                      </Link>
                      <div className="mt-0.5 whitespace-nowrap text-xs text-muted-foreground">
                        {v.imo ? `IMO ${v.imo}` : t("noImo")} · {labels.type(v.type)}
                        {v.condition ? ` · ${labels.condition(v.condition)}` : ""}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={TD}>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <StageBadge stage={v.stage} />
                    {unpaid ? <UnpaidBadge days={daysSince(v.departedAt)} /> : null}
                  </div>
                  <div className="mt-1.5 whitespace-nowrap text-xs font-medium text-muted-foreground">→ {labels.destination(v.destination)}</div>
                </td>
                <td className={cn(TD, "tabular whitespace-nowrap text-[13px]")}>{fmt.dateTime(v.etaSulina)}</td>
                <td className={cn(TD, "tabular whitespace-nowrap text-[13px]")}>{fmt.dateTime(v.arrivedAt)}</td>
                <td className={cn(TD, "tabular whitespace-nowrap text-[13px]")}>{fmt.dateTime(v.inPortAt)}</td>
                <td className={cn(TD, "tabular whitespace-nowrap text-[13px]")}>{fmt.dateTime(v.departedAt)}</td>
                {restricted ? null : (
                  <>
                    <td className={TD}>
                      <ChecklistRow vessel={v} editable={editable} />
                    </td>
                    <td className={TD}>
                      <Progress vessel={v} />
                    </td>
                    <td className={cn(TD, "hidden whitespace-nowrap text-xs text-muted-foreground 2xl:table-cell")}>
                      <div className="font-medium text-foreground/80">{fmt.relative(v.updatedAt)}</div>
                      <div className="truncate">{v.updatedBy ? userName(v.updatedBy) : ""}</div>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
