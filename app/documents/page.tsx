"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { DocumentsView } from "@/components/ops/documents/DocumentsView";

export default function DocumentsPage() {
  return (
    <AppShell title="Documents" access="staff">
      <DocumentsView />
    </AppShell>
  );
}
