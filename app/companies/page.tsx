"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { ContactsDirectory } from "@/components/ops/contacts/ContactsDirectory";

export default function CompaniesPage() {
  const t = useTranslations("companies");
  return (
    <AppShell title={t("title")}>
      <Suspense fallback={null}>
        <ContactsDirectory />
      </Suspense>
    </AppShell>
  );
}
