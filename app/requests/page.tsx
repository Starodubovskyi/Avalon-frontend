"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { RequestsInbox } from "@/components/ops/requests/RequestsInbox";

export default function RequestsPage() {
  return (
    <AppShell title="Agency requests" access="staff">
      <RequestsInbox />
    </AppShell>
  );
}
