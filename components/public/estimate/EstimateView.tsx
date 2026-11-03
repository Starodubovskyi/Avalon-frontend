"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { estimatePda, normalizePdaInput, type PdaInput } from "@/lib/public/pdaTariffs";
import { IndicativeNote } from "../IndicativeNote";
import { PublicPageIntro } from "../PublicShell";
import { EstimateForm, type EstimateDraft } from "./EstimateForm";
import { EstimateBreakdown, EstimateTotal } from "./EstimateBreakdown";

function draftFrom(input: PdaInput): EstimateDraft {
  return {
    port: input.port,
    vesselType: input.vesselType,
    condition: input.condition,
    gt: String(input.gt),
    loa: String(input.loa),
    days: String(input.days),
  };
}

export function EstimateView() {
  const t = useTranslations("publicPages");
  const params = useSearchParams();
  const [draft, setDraft] = useState<EstimateDraft>(() =>
    draftFrom(
      normalizePdaInput({
        port: params?.get("port") ?? null,
        vesselType: params?.get("type") ?? null,
        gt: params?.get("gt") ?? null,
        loa: params?.get("loa") ?? null,
        days: params?.get("days") ?? null,
        condition: params?.get("condition") ?? null,
      }),
    ),
  );

  // Recomputed on every keystroke: the model is a handful of multiplications
  const estimate = useMemo(() => estimatePda(normalizePdaInput(draft)), [draft]);

  return (
    <>
      <PublicPageIntro eyebrow={t("estimate.eyebrow")} title={t("estimate.title")} subtitle={t("estimate.subtitle")}>
        <IndicativeNote className="mt-6 max-w-3xl">
          <span className="font-semibold">{t("estimate.noteTitle")}</span> {t("estimate.noteText")}
        </IndicativeNote>
      </PublicPageIntro>

      <div className="mx-auto grid max-w-7xl items-start gap-6 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[400px_1fr] lg:px-8">
        <aside className="rounded-2xl border bg-card p-5 shadow-card sm:p-6 lg:sticky lg:top-20">
          <h2 className="font-display text-[15px] font-bold tracking-[-0.01em]">{t("estimate.formTitle")}</h2>
          <p className="mb-5 mt-0.5 text-xs text-muted-foreground">{t("estimate.formHint")}</p>
          <EstimateForm draft={draft} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
          <Link
            href="/port-guide"
            className="mt-6 flex min-h-[40px] items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            <BookOpen className="h-4 w-4" aria-hidden /> {t("estimate.guideLink")}
          </Link>
        </aside>

        <div className="min-w-0 space-y-5">
          <EstimateTotal estimate={estimate} />
          <EstimateBreakdown estimate={estimate} />
        </div>
      </div>
    </>
  );
}
