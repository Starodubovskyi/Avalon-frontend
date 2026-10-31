"use client";

import { AppShell } from "@/components/ops/shell/AppShell";
import { TasksView } from "@/components/ops/tasks/TasksView";

export default function TasksPage() {
  return (
    <AppShell title="Tasks" access="staff">
      <TasksView />
    </AppShell>
  );
}
