"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { ActivityView } from "@/components/ops/overview/ActivityView";

export default function ActivityPage() {
  return (
    <AppShell title="Activity log" access="staff">
      <ActivityView />
    </AppShell>
  );
}
