"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { SupportView } from "@/components/ops/support/SupportView";
import ChatBot from "@/components/Bot/ChatBot";

export default function SupportPage() {
  const t = useTranslations("support.page");
  return (
    <AppShell title={t("title")} access="any">
      <SupportView />
      <ChatBot />
    </AppShell>
  );
}
