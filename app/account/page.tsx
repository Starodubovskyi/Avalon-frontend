"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { AccountView } from "@/components/ops/account/AccountView";

export default function AccountPage() {
  return (
    <AppShell title="Account">
      <AccountView />
    </AppShell>
  );
}
