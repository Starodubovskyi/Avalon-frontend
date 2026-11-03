"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { ActivityView } from "@/components/ops/overview/ActivityView";

export default function ActivityPage() {
  const t = useTranslations("activity");
  return (
    <AppShell title={t("title")} access="staff">
      <ActivityView />
    </AppShell>
  );
}
