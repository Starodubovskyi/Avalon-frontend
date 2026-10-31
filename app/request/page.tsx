"use client";

import { Suspense } from "react";
import { AppShell } from "@/components/ops/shell/AppShell";
import { RequestView } from "@/components/ops/requests/RequestView";

export default function RequestPage() {
  return (
    <AppShell title="Request agency" access="any">
      <Suspense fallback={null}>
        <RequestView />
      </Suspense>
    </AppShell>
  );
}
