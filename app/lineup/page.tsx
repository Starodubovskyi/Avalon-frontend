"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { LineupView } from "@/components/ops/lineup/LineupView";

export default function LineUpPage() {
  return (
    <AppShell title="Line-up">
      <LineupView />
    </AppShell>
  );
}
