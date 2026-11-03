import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PublicShell } from "@/components/public/PublicShell";
import { EstimateView } from "@/components/public/estimate/EstimateView";
import { LoadingBlock } from "@/components/ops/ui/primitives";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("publicPages");
  return { title: t("estimate.metaTitle"), description: t("estimate.metaDescription") };
}

export default async function EstimatePage() {
  const t = await getTranslations("publicPages");
  return (
    <PublicShell>
      <Suspense fallback={<LoadingBlock label={t("estimate.loading")} />}>
        <EstimateView />
      </Suspense>
    </PublicShell>
  );
}
