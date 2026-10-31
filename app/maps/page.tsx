"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/ops/shell/AppShell";
import { FleetMapView } from "@/components/ops/map/FleetMapView";

export default function MapsPage() {
  return (
    <AppShell title="Fleet map" fill>
      <Suspense fallback={null}>
        <FleetMapView />
      </Suspense>
    </AppShell>
  );
}
