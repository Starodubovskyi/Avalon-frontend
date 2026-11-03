"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { BalanceView } from "@/components/ops/balance/BalanceView";

export default function BalancePage() {
  const t = useTranslations("balance");
  return (
    <AppShell title={t("title")}>
      <Suspense fallback={null}>
        <BalanceView />
      </Suspense>
    </AppShell>
  );
}
