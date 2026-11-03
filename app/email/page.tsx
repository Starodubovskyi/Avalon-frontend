"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { EmailComposer } from "@/components/ops/email/EmailComposer";

export default function EmailPage() {
  const t = useTranslations("email");
  return (
    <AppShell title={t("shellTitle")} access="staff">
      <EmailComposer />
    </AppShell>
  );
}
