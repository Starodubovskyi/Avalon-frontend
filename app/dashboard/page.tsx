"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { OverviewView } from "@/components/ops/overview/OverviewView";

export default function DashboardPage() {
  return (
    <AppShell title="Overview">
      <OverviewView />
    </AppShell>
  );
}
