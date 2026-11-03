"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { DocumentsView } from "@/components/ops/documents/DocumentsView";

export default function DocumentsPage() {
  const t = useTranslations("documents");
  return (
    <AppShell title={t("pageTitle")} access="staff">
      <DocumentsView />
    </AppShell>
  );
}
