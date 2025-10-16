"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Status = "todo" | "inprogress" | "done";
export type Priority = "low" | "normal" | "high";

export type User = { id: string; name: string; avatarUrl?: string };
export type Subtask = { id: string; title: string; done: boolean };

export type Task = {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string | null;
  status: Status;
  priority: Priority;
  dueAt?: string | null;

  startedAt?: string | null;
  completedAt?: string | null;

  categories?: string[];
  subtasks?: Subtask[];

  createdAt: string;
  updatedAt: string;
  order: number;
};

export type Activity = {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  taskId?: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  summary: string;
  memberIds: string[];
  ownerId: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
const nowISO = () => new Date().toISOString();
function assertProject(p: Project | null): asserts p is Project {
  if (!p) throw new Error("Project is null");
}

function sortByOrder(a: Task, b: Task) {
  return a.order - b.order;
}
function splitByStatus(all: Record<string, Task>) {
  const arr = Object.values(all);
  return {
    todo: arr.filter((t) => t.status === "todo").sort(sortByOrder),
    inprogress: arr.filter((t) => t.status === "inprogress").sort(sortByOrder),
    done: arr.filter((t) => t.status === "done").sort(sortByOrder),
  };
}

const initialUsers: Record<string, User> = {
  u1: { id: "u1", name: "Savannah Dune" },
  u2: { id: "u2", name: "Jane Doe" },
  u3: { id: "u3", name: "Alex Carter" },
};

export type UIState = {
  view: "overview" | "list" | "board" | "calendar" | "files";
  setView: (v: UIState["view"]) => void;
};
export const useUIStore = create<UIState>()((set) => ({
  view: "overview",
  setView: (v) => set({ view: v }),
}));

export type ProjectState = {
  users: Record<string, User>;
  project: Project | null;
  tasks: Record<string, Task>;
  activities: Activity[];
  _hasHydrated: boolean;
  setHasHydrated: (b: boolean) => void;

  currentUserId: string | null;
  setCurrentUser: (u: { name: string; avatarUrl?: string }) => void;
  updateCurrentUser: (patch: Partial<User>) => void;
  signOut: () => void;

  createProject: (input: {
    name: string;
    description: string;
    memberIds: string[];
  }) => void;
  resetProject: () => void;
  renameProject: (name: string) => void;
  seedDemo: () => void;
  addUser: (name: string) => string;

  updateProjectDescription: (text: string) => void;
  updateSummary: (text: string) => void;
  addMember: (userId: string) => void;
  removeMember: (userId: string) => void;

  createTask: (input: {
    title: string;
    assigneeId?: string;
    dueAt?: string;
    status?: Status;
    priority?: Priority;
  }) => void;

  updateTask: (taskId: string, patch: Partial<Task>) => void;
  assignTask: (taskId: string, userId: string | null) => void;
  setStartDate: (taskId: string, iso?: string | null) => void;
  setDueDate: (taskId: string, iso?: string | null) => void;
  setPriority: (taskId: string, priority: Priority) => void;

  markStarted: (taskId: string, iso?: string) => void;
  markCompleted: (taskId: string, iso?: string) => void;

  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;

  moveTask: (taskId: string, toStatus: Status, toIndex: number) => void;

  deleteTask: (taskId: string) => void;
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      users: initialUsers,
      project: null,
      tasks: {},
      activities: [],
      _hasHydrated: false,
      setHasHydrated: (b) => set({ _hasHydrated: b }),

      currentUserId: null,
      setCurrentUser: ({ name, avatarUrl }) =>
        set((s) => {
          let id = s.currentUserId;
          const users = { ...s.users };
          if (id && users[id]) {
            users[id] = { ...users[id], name, avatarUrl };
          } else {
            id = "me_" + Math.random().toString(36).slice(2, 8);
            users[id] = { id, name, avatarUrl };
          }
          return { users, currentUserId: id };
        }),
      updateCurrentUser: (patch) =>
        set((s) => {
          const id = s.currentUserId;
          if (!id) return {} as any;
          const u = s.users[id];
          if (!u) return {} as any;
          return { users: { ...s.users, [id]: { ...u, ...patch } } };
        }),
      signOut: () => set({ currentUserId: null }),

      createProject: ({ name, description, memberIds }) =>
        set((s) => {
          const ownerId = s.currentUserId || "owner_" + uid();
          const members = Array.from(new Set([...(memberIds || []), ownerId]));
          return {
            project: {
              id: uid(),
              name,
              description,
              summary:
                "This project focuses on delivering a streamlined and efficient solution to meet business needs. Carefully planned to achieve success.",
              memberIds: members,
              ownerId,
            },
            tasks: {},
            activities: [
              {
                id: uid(),
                type: "created",
                message: `Project “${name}” created`,
                createdAt: nowISO(),
              },
            ],
          };
        }),

      resetProject: () =>
        set(() => ({ project: null, tasks: {}, activities: [] })),

      renameProject: (name) =>
        set((s) => {
          const p = s.project;
          assertProject(p);
          return { project: { ...p, name } };
        }),

      seedDemo: () =>
        set((s) => {
          const tasks = { ...s.tasks };
          const add = (title: string, status: Status, priority: Priority) => {
            const id = uid();
            tasks[id] = {
              id,
              title,
              assigneeId: null,
              status,
              priority,
              dueAt: null,
              startedAt: null,
              completedAt: status === "done" ? nowISO() : null,
              categories: [],
              subtasks: [],
              description: "",
              createdAt: nowISO(),
              updatedAt: nowISO(),
              order: Object.keys(tasks).length + 1,
            };
          };
          add("Solutions Pages", "todo", "normal");
          add("Order Flow", "inprogress", "high");
          add("About Us Illustration", "done", "normal");
          return { tasks };
        }),

      addUser: (name) => {
        const id = uid();
        set((s) => ({ users: { ...s.users, [id]: { id, name } } }));
        return id;
      },

      updateProjectDescription: (text) =>
        set((s) => {
          const p = s.project;
          assertProject(p);
          return { project: { ...p, description: text } };
        }),
      updateSummary: (text) =>
        set((s) => {
          const p = s.project;
          assertProject(p);
          return { project: { ...p, summary: text } };
        }),
      addMember: (userId) =>
        set((s) => {
          const p = s.project;
          assertProject(p);
          return {
            project: {
              ...p,
              memberIds: Array.from(new Set([...p.memberIds, userId])),
            },
          };
        }),
      removeMember: (userId) =>
        set((s) => {
          const p = s.project;
          assertProject(p);
          return {
            project: {
              ...p,
              memberIds: p.memberIds.filter((id) => id !== userId),
            },
          };
        }),

      createTask: ({ title, assigneeId, dueAt, status, priority }) =>
        set((s) => {
          const id = uid();
          const t: Task = {
            id,
            title,
            assigneeId: assigneeId || null,
            status: status || "todo",
            priority: priority || "normal",
            dueAt: dueAt || null,
            startedAt: null,
            completedAt: null,
            categories: [],
            subtasks: [],
            description: "",
            createdAt: nowISO(),
            updatedAt: nowISO(),
            order: Object.keys(s.tasks).length + 1,
          };
          return {
            tasks: { ...s.tasks, [id]: t },
            activities: [
              {
                id: uid(),
                type: "created",
                message: `Task “${title}” created`,
                createdAt: nowISO(),
                taskId: id,
              },
              ...s.activities,
            ],
          };
        }),

      updateTask: (taskId, patch) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          return {
            tasks: {
              ...s.tasks,
              [taskId]: { ...t, ...patch, updatedAt: nowISO() },
            },
          };
        }),

      assignTask: (taskId, userId) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          const u = userId ? s.users[userId]?.name : "Unassigned";
          return {
            tasks: {
              ...s.tasks,
              [taskId]: { ...t, assigneeId: userId, updatedAt: nowISO() },
            },
            activities: [
              {
                id: uid(),
                type: "assigned",
                message: `Assignee updated for “${t.title}” → ${u}`,
                createdAt: nowISO(),
                taskId,
              },
              ...s.activities,
            ],
          };
        }),

      setStartDate: (taskId, iso) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          return {
            tasks: {
              ...s.tasks,
              [taskId]: { ...t, startedAt: iso || null, updatedAt: nowISO() },
            },
          };
        }),

      setDueDate: (taskId, iso) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          return {
            tasks: {
              ...s.tasks,
              [taskId]: { ...t, dueAt: iso || null, updatedAt: nowISO() },
            },
            activities: [
              {
                id: uid(),
                type: "due_changed",
                message: `Due date updated for “${t.title}”`,
                createdAt: nowISO(),
                taskId,
              },
              ...s.activities,
            ],
          };
        }),

      setPriority: (taskId, priority) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          return {
            tasks: {
              ...s.tasks,
              [taskId]: { ...t, priority, updatedAt: nowISO() },
            },
            activities: [
              {
                id: uid(),
                type: "priority",
                message: `Priority updated for “${t.title}” → ${priority}`,
                createdAt: nowISO(),
                taskId,
              },
              ...s.activities,
            ],
          };
        }),

      markStarted: (taskId, iso) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          return {
            tasks: {
              ...s.tasks,
              [taskId]: {
                ...t,
                status: "inprogress",
                startedAt: iso || nowISO(),
                updatedAt: nowISO(),
              },
            },
          };
        }),

      markCompleted: (taskId, iso) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          return {
            tasks: {
              ...s.tasks,
              [taskId]: {
                ...t,
                status: "done",
                completedAt: iso || nowISO(),
                updatedAt: nowISO(),
              },
            },
          };
        }),

      addSubtask: (taskId, title) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          const st = [...(t.subtasks || []), { id: uid(), title, done: false }];
          return {
            tasks: {
              ...s.tasks,
              [taskId]: { ...t, subtasks: st, updatedAt: nowISO() },
            },
          };
        }),

      toggleSubtask: (taskId, subtaskId) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          const st = (t.subtasks || []).map((x) =>
            x.id === subtaskId ? { ...x, done: !x.done } : x
          );
          return {
            tasks: {
              ...s.tasks,
              [taskId]: { ...t, subtasks: st, updatedAt: nowISO() },
            },
          };
        }),

      removeSubtask: (taskId, subtaskId) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          const st = (t.subtasks || []).filter((x) => x.id !== subtaskId);
          return {
            tasks: {
              ...s.tasks,
              [taskId]: { ...t, subtasks: st, updatedAt: nowISO() },
            },
          };
        }),

      moveTask: (taskId, toStatus, toIndex) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;

          const { todo, inprogress, done } = splitByStatus(s.tasks);
          let todoIds = todo.map((x) => x.id);
          let inprogressIds = inprogress.map((x) => x.id);
          let doneIds = done.map((x) => x.id);

          const fromKey: Status = todoIds.includes(taskId)
            ? "todo"
            : inprogressIds.includes(taskId)
            ? "inprogress"
            : "done";

          const removeFrom = (arr: string[]) => {
            const i = arr.indexOf(taskId);
            if (i >= 0) arr.splice(i, 1);
          };
          if (fromKey === "todo") removeFrom(todoIds);
          if (fromKey === "inprogress") removeFrom(inprogressIds);
          if (fromKey === "done") removeFrom(doneIds);

          const insertTo = (arr: string[]) => {
            const idx = Math.max(0, Math.min(toIndex, arr.length));
            arr.splice(idx, 0, taskId);
          };
          if (toStatus === "todo") insertTo(todoIds);
          if (toStatus === "inprogress") insertTo(inprogressIds);
          if (toStatus === "done") insertTo(doneIds);

          const newTasks: Record<string, Task> = { ...s.tasks };
          const apply = (ids: string[], status: Status) => {
            ids.forEach((id, i) => {
              const src = newTasks[id];
              newTasks[id] = {
                ...src,
                status,
                startedAt:
                  status === "inprogress" && !src.startedAt
                    ? nowISO()
                    : src.startedAt || null,
                completedAt:
                  status === "done" && !src.completedAt
                    ? nowISO()
                    : src.completedAt || null,
                order: i + 1,
                updatedAt: id === taskId ? nowISO() : src.updatedAt,
              };
            });
          };
          apply(todoIds, "todo");
          apply(inprogressIds, "inprogress");
          apply(doneIds, "done");

          return {
            tasks: newTasks,
            activities: [
              {
                id: uid(),
                type: "moved",
                message: `Task “${t.title}” moved to ${toStatus}`,
                createdAt: nowISO(),
                taskId,
              },
              ...s.activities,
            ],
          };
        }),

      deleteTask: (taskId) =>
        set((s) => {
          const t = s.tasks[taskId];
          if (!t) return {} as any;
          const tasks = { ...s.tasks };
          delete tasks[taskId];
          return {
            tasks,
            activities: [
              {
                id: uid(),
                type: "removed",
                message: `Task “${t.title}” deleted`,
                createdAt: nowISO(),
                taskId,
              },
              ...s.activities,
            ],
          };
        }),
    }),
    {
      name: "tasks-project-state",
      onRehydrateStorage: () => (st) => {
        try {
          st?.setHasHydrated(true);
        } catch {}
      },
    }
  )
);
