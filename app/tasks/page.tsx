"use client";

import HydrateOwnerFromLocalProfile from "@/components/tasks/HydrateOwnerFromLocalProfile.tsx";
import TasksClient from "@/components/tasks/TasksClient";

export default function TasksPage() {
  return (
    <>
      <HydrateOwnerFromLocalProfile />
      <TasksClient />
    </>
  );
}
