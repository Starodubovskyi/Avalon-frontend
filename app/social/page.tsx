"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { FeedView } from "@/components/ops/social/FeedView";

export default function FeedPage() {
  const t = useTranslations("social");
  return (
    <AppShell title={t("pageTitle")}>
      <FeedView />
    </AppShell>
  );
}
