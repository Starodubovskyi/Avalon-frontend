"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { FeedView } from "@/components/ops/social/FeedView";

export default function FeedPage() {
  return (
    <AppShell title="Feed">
      <FeedView />
    </AppShell>
  );
}
