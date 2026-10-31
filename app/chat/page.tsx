"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/ops/shell/AppShell";
import { ChatView } from "@/components/ops/chat/ChatView";

export default function ChatPage() {
  return (
    <AppShell title="Chat" fill>
      <Suspense fallback={null}>
        <ChatView />
      </Suspense>
    </AppShell>
  );
}
