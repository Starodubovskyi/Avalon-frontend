"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { AccountView } from "@/components/ops/account/AccountView";

export default function AccountPage() {
  const t = useTranslations("account");
  return (
    <AppShell title={t("pageTitle")}>
      <AccountView />
    </AppShell>
  );
}
