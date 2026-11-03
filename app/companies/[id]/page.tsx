"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { CompanyProfileView } from "@/components/ops/companies/CompanyProfileView";

export default function CompanyPage({ params }: { params: { id: string } }) {
  const t = useTranslations("companies");
  return (
    <AppShell title={t("profile.pageTitle")}>
      <CompanyProfileView id={params.id} />
    </AppShell>
  );
}
