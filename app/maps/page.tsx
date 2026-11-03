"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { FleetMapView } from "@/components/ops/map/FleetMapView";

export default function MapsPage() {
  const t = useTranslations("map");
  return (
    <AppShell title={t("pageTitle")} fill>
      <Suspense fallback={null}>
        <FleetMapView />
      </Suspense>
    </AppShell>
  );
}
