"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { RequestsInbox } from "@/components/ops/requests/RequestsInbox";

export default function RequestsPage() {
  const t = useTranslations("requests");
  return (
    <AppShell title={t("pageTitleInbox")} access="staff">
      <RequestsInbox />
    </AppShell>
  );
}
