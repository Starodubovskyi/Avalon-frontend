"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { VesselDetail } from "@/components/ops/vessels/VesselDetail";

export default function VesselPage({ params }: { params: { id: string } }) {
  return (
    <AppShell title="Vessel card">
      <VesselDetail id={params.id} />
    </AppShell>
  );
}
