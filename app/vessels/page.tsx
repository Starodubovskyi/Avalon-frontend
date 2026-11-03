"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { VesselBoard } from "@/components/ops/vessels/VesselBoard";

export default function VesselsPage() {
  const t = useTranslations("vessels.shell");
  return (
    <AppShell title={t("board")}>
      <Suspense fallback={null}>
        <VesselBoard />
      </Suspense>
    </AppShell>
  );
}
