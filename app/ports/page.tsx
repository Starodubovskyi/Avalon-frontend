"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { PortsView } from "@/components/ops/ports/PortsView";

export default function PortsPage() {
  return (
    <AppShell title="Ports" access="staff">
      <PortsView />
    </AppShell>
  );
}
