"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { SettingsView } from "@/components/ops/settings/SettingsView";

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <SettingsView />
    </AppShell>
  );
}
