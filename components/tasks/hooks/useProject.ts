"use client";

import { useProjectStore, type Project } from "../store/tasks";

export default function useProject(): Project {
  const project = useProjectStore((s) => s.project);
  if (!project) {
    throw new Error(
      "Project is null. Render this component only after onboarding."
    );
  }
  return project;
}
