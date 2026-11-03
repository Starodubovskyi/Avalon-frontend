"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/ops/shell/AppShell";
import { TasksView } from "@/components/ops/tasks/TasksView";

export default function TasksPage() {
  const t = useTranslations("tasks");
  return (
    <AppShell title={t("shellTitle")} access="staff">
      <TasksView />
    </AppShell>
  );
}
