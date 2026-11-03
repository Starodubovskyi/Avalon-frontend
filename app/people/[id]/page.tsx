"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { PersonProfileView } from "@/components/ops/profiles/PersonProfileView";

export default function PersonPage({ params }: { params: { id: string } }) {
  const t = useTranslations("profiles");
  const id = Number(params.id);
  return (
    <AppShell title={t("pageTitle")}>
      <PersonProfileView userId={Number.isInteger(id) && id > 0 ? id : null} />
    </AppShell>
  );
}
