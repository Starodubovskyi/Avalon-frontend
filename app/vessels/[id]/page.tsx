"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { VesselDetail } from "@/components/ops/vessels/VesselDetail";

export default function VesselPage({ params }: { params: { id: string } }) {
  const t = useTranslations("vessels.shell");
  return (
    <AppShell title={t("card")}>
      <VesselDetail id={params.id} />
    </AppShell>
  );
}
