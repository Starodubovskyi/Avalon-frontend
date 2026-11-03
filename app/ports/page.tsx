"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { PortsView } from "@/components/ops/ports/PortsView";

export default function PortsPage() {
  const t = useTranslations("ports");
  return (
    <AppShell title={t("shellTitle")} access="staff">
      <PortsView />
    </AppShell>
  );
}
