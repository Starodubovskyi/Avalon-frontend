"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { ContactsDirectory } from "@/components/ops/contacts/ContactsDirectory";

export default function CompaniesPage() {
  return (
    <AppShell title="Companies & contacts" access="staff">
      <ContactsDirectory />
    </AppShell>
  );
}
