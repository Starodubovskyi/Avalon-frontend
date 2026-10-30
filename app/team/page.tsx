"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { TeamView } from "@/components/ops/team/TeamView";

export default function TeamPage() {
  return (
    <AppShell title="Team" access="admin">
      <TeamView />
    </AppShell>
  );
}
