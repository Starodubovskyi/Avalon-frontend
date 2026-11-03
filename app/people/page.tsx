"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { PeopleView } from "@/components/ops/people/PeopleView";

export default function PeoplePage() {
  const t = useTranslations("people");
  return (
    <AppShell title={t("title")}>
      <PeopleView />
    </AppShell>
  );
}
