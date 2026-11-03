"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { TeamView } from "@/components/ops/team/TeamView";

export default function TeamPage() {
  const t = useTranslations("team");
  return (
    <AppShell title={t("pageTitle")} access="admin">
      <TeamView />
    </AppShell>
  );
}
