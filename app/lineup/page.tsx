"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { LineupView } from "@/components/ops/lineup/LineupView";

export default function LineUpPage() {
  const t = useTranslations("lineup");
  return (
    <AppShell title={t("shellTitle")}>
      <LineupView />
    </AppShell>
  );
}
