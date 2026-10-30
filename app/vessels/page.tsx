"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/ops/shell/AppShell";
import { VesselBoard } from "@/components/ops/vessels/VesselBoard";

export default function VesselsPage() {
  return (
    <AppShell title="Vessels board">
      <Suspense fallback={null}>
        <VesselBoard />
      </Suspense>
    </AppShell>
  );
}
