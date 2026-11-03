"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { ChatView } from "@/components/ops/chat/ChatView";

export default function ChatPage() {
  const t = useTranslations("chat");
  return (
    <AppShell title={t("pageTitle")} fill>
      <Suspense fallback={null}>
        <ChatView />
      </Suspense>
    </AppShell>
  );
}
