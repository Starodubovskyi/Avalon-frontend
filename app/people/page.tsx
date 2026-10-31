"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { PeopleView } from "@/components/ops/people/PeopleView";

export default function PeoplePage() {
  return (
    <AppShell title="People">
      <PeopleView />
    </AppShell>
  );
}
