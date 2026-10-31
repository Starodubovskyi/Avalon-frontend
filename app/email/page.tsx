"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { EmailComposer } from "@/components/ops/email/EmailComposer";

export default function EmailPage() {
  return (
    <AppShell title="Email" access="staff">
      <EmailComposer />
    </AppShell>
  );
}
