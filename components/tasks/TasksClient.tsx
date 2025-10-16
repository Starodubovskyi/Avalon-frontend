"use client";

import { useState } from "react";
import { useProjectStore, useUIStore } from "./store/tasks";

import TabsBar from "@/components/tasks/TabsBar";
import QuickActions from "@/components/tasks/Overview/QuickActions";
import ProjectDescription from "@/components/tasks/Overview/ProjectDescription";
import Assignees from "@/components/tasks/Overview/Assignees";
import RecentTasks from "@/components/tasks/Overview/RecentTasks";
import Summary from "@/components/tasks/Overview/Summary";
import RecentActivity from "@/components/tasks/Overview/RecentActivity";
import Calendar from "@/components/tasks/calendar/Calendar";
import FilesView from "@/components/tasks/files/FilesView";
import ProjectNameInline from "@/components/tasks/Project/ProjectNameInline";
import CreateProjectScreen from "@/components/tasks/Onboarding/CreateProjectScreen";

import ListToolbar from "./list/ListToolbar";
import TasksList from "./list/TasksList";
import QuickCreateTaskModal from "./list/QuickCreateTaskModal";
import Board from "@/components/tasks/Board/Board";

export default function TasksClient() {
  const hydrated = useProjectStore((s) => s._hasHydrated);
  const project = useProjectStore((s) => s.project);
  const view = useUIStore((s) => s.view);

  const [filters, setFilters] = useState<{
    due: "any" | "today" | "week" | "overdue";
    assignee: "all" | "unassigned" | string;
    priority: "all" | "low" | "normal" | "high";
  }>({ due: "any", assignee: "all", priority: "all" });
  const [openQuick, setOpenQuick] = useState(false);

  if (!hydrated) return null;

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Create project
          </h1>
        </div>
        <CreateProjectScreen />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectNameInline />

      <TabsBar active={view} />

      {view === "overview" && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8 space-y-6">
            <QuickActions />
            <ProjectDescription />
            <Assignees />
            <RecentTasks />
          </div>
          <div className="col-span-12 xl:col-span-4 space-y-6">
            <Summary />
            <RecentActivity />
          </div>
        </div>
      )}

      {view === "list" && (
        <>
          <ListToolbar
            value={filters}
            onChange={setFilters}
            onAddNew={() => setOpenQuick(true)}
          />
          <TasksList filters={filters} />
          <QuickCreateTaskModal
            open={openQuick}
            onClose={() => setOpenQuick(false)}
          />
        </>
      )}

      {view === "board" && (
        <>
          <ListToolbar
            value={filters}
            onChange={setFilters}
            onAddNew={() => setOpenQuick(true)}
          />
          <Board filters={filters} />
          <QuickCreateTaskModal
            open={openQuick}
            onClose={() => setOpenQuick(false)}
          />
        </>
      )}

      {view === "calendar" && <Calendar />}

      {view === "files" && <FilesView />}
    </div>
  );
}
