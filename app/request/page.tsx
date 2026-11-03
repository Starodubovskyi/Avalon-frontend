"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { RequestView } from "@/components/ops/requests/RequestView";

export default function RequestPage() {
  const t = useTranslations("requests");
  return (
    <AppShell title={t("pageTitleRequest")} access="any">
      <Suspense fallback={null}>
        <RequestView />
      </Suspense>
    </AppShell>
  );
}
