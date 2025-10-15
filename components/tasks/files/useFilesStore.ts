"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FileType = "image" | "pdf" | "doc" | "video" | "other";

export type FileVersion = {
  id: string;
  name: string;
  size: number;
  mime: string;
  createdAt: string;
  dataUrl?: string;
};

export type FileItem = {
  id: string;
  name: string;
  ext: string;
  size: number;
  mime: string;
  type: FileType;
  dataUrl?: string;
  createdAt: string;
  updatedAt: string;
  ownerId?: string | null;
  folderId?: string | null;
  starred?: boolean;
  tags?: string[];
  version: number;
  history: FileVersion[];
};

export type Folder = {
  id: string;
  name: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
};

type SortBy = "name" | "date" | "size";
type SortDir = "asc" | "desc";

export type FilesState = {
  files: Record<string, FileItem>;
  folders: Record<string, Folder>;

  currentFolderId: string | null;
  viewMode: "grid" | "list";
  search: string;
  filterType: "all" | FileType;
  onlyStarred: boolean;
  sortBy: SortBy;
  sortDir: SortDir;

  setCurrentFolder: (id: string | null) => void;
  setViewMode: (m: "grid" | "list") => void;
  setSearch: (q: string) => void;
  setFilterType: (t: FilesState["filterType"]) => void;
  setOnlyStarred: (b: boolean) => void;
  setSort: (by: SortBy, dir: SortDir) => void;

  createFolder: (name: string, parentId?: string | null) => string;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;

  uploadFiles: (
    files: File[],
    folderId?: string | null,
    ownerId?: string | null
  ) => Promise<string[]>;
  replaceFileVersion: (fileId: string, file: File) => Promise<void>;

  renameFile: (id: string, name: string) => void;
  toggleStar: (id: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  moveItems: (ids: string[], folderId: string | null) => void;
  deleteItems: (ids: string[]) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const extFromName = (name: string) => {
  const i = name.lastIndexOf(".");
  return i > -1 ? name.slice(i + 1).toLowerCase() : "";
};

const typeFromMime = (mime: string, ext: string): FileType => {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (
    mime.includes("msword") ||
    mime.includes("officedocument") ||
    ["doc", "docx", "txt", "md", "rtf"].includes(ext)
  )
    return "doc";
  if (mime.startsWith("video/")) return "video";
  return "other";
};

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(String(reader.result));
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

export const useFilesStore = create<FilesState>()(
  persist(
    (set, get) => ({
      files: {},
      folders: {
        root: {
          id: "root",
          name: "All files",
          parentId: null,
          createdAt: now(),
          updatedAt: now(),
        },
      },

      currentFolderId: null,
      viewMode: "grid",
      search: "",
      filterType: "all",
      onlyStarred: false,
      sortBy: "date",
      sortDir: "desc",

      setCurrentFolder: (id) => set({ currentFolderId: id }),
      setViewMode: (m) => set({ viewMode: m }),
      setSearch: (q) => set({ search: q }),
      setFilterType: (t) => set({ filterType: t }),
      setOnlyStarred: (b) => set({ onlyStarred: b }),
      setSort: (by, dir) => set({ sortBy: by, sortDir: dir }),

      createFolder: (name, parentId = get().currentFolderId ?? null) => {
        const id = uid();
        const folder: Folder = {
          id,
          name,
          parentId: parentId ?? null,
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ folders: { ...s.folders, [id]: folder } }));
        return id;
      },

      renameFolder: (id, name) =>
        set((s) => ({
          folders: {
            ...s.folders,
            [id]: { ...s.folders[id], name, updatedAt: now() },
          },
        })),

      deleteFolder: (id) =>
        set((s) => {
          const files: Record<string, FileItem> = { ...s.files };
          Object.values(files).forEach((f) => {
            if (f.folderId === id) f.folderId = null;
          });
          const folders = { ...s.folders };
          delete folders[id];
          return { files, folders, currentFolderId: null };
        }),

      uploadFiles: async (
        fileList,
        folderId = get().currentFolderId ?? null,
        ownerId = null
      ) => {
        const dataUrls = await Promise.all(
          fileList.map((f) => fileToDataUrl(f).catch(() => ""))
        );
        const ids: string[] = [];
        set((s) => {
          const next = { ...s.files };
          fileList.forEach((file, i) => {
            const id = uid();
            const ext = extFromName(file.name);
            const mime = file.type || "application/octet-stream";
            const type = typeFromMime(mime, ext);
            const rec: FileItem = {
              id,
              name: file.name,
              ext,
              size: file.size,
              mime,
              type,
              dataUrl: dataUrls[i] || undefined,
              createdAt: now(),
              updatedAt: now(),
              ownerId,
              folderId: folderId ?? null,
              starred: false,
              tags: [],
              version: 1,
              history: [],
            };
            next[id] = rec;
            ids.push(id);
          });
          return { files: next };
        });
        return ids;
      },

      replaceFileVersion: async (fileId, file) => {
        const dataUrl = await fileToDataUrl(file).catch(() => "");
        set((s) => {
          const old = s.files[fileId];
          if (!old) return s as any;
          const v: FileVersion = {
            id: uid(),
            name: old.name,
            size: old.size,
            mime: old.mime,
            createdAt: old.updatedAt,
            dataUrl: old.dataUrl,
          };
          const ext = extFromName(file.name);
          const mime = file.type || "application/octet-stream";
          const type = typeFromMime(mime, ext);
          return {
            files: {
              ...s.files,
              [fileId]: {
                ...old,
                name: file.name,
                ext,
                size: file.size,
                mime,
                type,
                dataUrl: dataUrl || undefined,
                updatedAt: now(),
                version: old.version + 1,
                history: [v, ...old.history],
              },
            },
          };
        });
      },

      renameFile: (id, name) =>
        set((s) => {
          const ext = extFromName(name);
          const mime = s.files[id]?.mime || "application/octet-stream";
          const type = typeFromMime(mime, ext);
          return {
            files: {
              ...s.files,
              [id]: { ...s.files[id], name, ext, type, updatedAt: now() },
            },
          };
        }),

      toggleStar: (id) =>
        set((s) => ({
          files: {
            ...s.files,
            [id]: {
              ...s.files[id],
              starred: !s.files[id]?.starred,
              updatedAt: now(),
            },
          },
        })),

      addTag: (id, tag) =>
        set((s) => {
          const setTags = new Set(s.files[id]?.tags || []);
          setTags.add(tag);
          return {
            files: {
              ...s.files,
              [id]: {
                ...s.files[id],
                tags: Array.from(setTags),
                updatedAt: now(),
              },
            },
          };
        }),

      removeTag: (id, tag) =>
        set((s) => ({
          files: {
            ...s.files,
            [id]: {
              ...s.files[id],
              tags: (s.files[id]?.tags || []).filter((t) => t !== tag),
              updatedAt: now(),
            },
          },
        })),

      moveItems: (ids, folderId) =>
        set((s) => {
          const next = { ...s.files };
          ids.forEach((id) => {
            if (next[id])
              next[id] = { ...next[id], folderId, updatedAt: now() };
          });
          return { files: next };
        }),

      deleteItems: (ids) =>
        set((s) => {
          const next = { ...s.files };
          ids.forEach((id) => delete next[id]);
          return { files: next };
        }),
    }),
    { name: "tasks-files-state" }
  )
);
