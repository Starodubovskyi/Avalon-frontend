import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/public/PublicShell";
import { EstimateView } from "@/components/public/estimate/EstimateView";
import { LoadingBlock } from "@/components/ops/ui/primitives";

export const metadata: Metadata = {
  title: "PDA estimate — Danube port call costs · Avalon Shipping",
  description:
    "Indicative proforma disbursement account for a Danube call via Sulina: channel dues, pilotage, port and berth dues, towage and agency fee in EUR.",
};

export default function EstimatePage() {
  return (
    <PublicShell>
      <Suspense fallback={<LoadingBlock label="Loading estimator…" />}>
        <EstimateView />
      </Suspense>
    </PublicShell>
  );
}
