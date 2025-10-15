"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FileItem = {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  folderId: string | null;
  starred?: boolean;
  version?: number;
  dataUrl?: string;
};

export type FolderItem = {
  id: string;
  name: string;
  createdAt: string;
  parentId: string | null;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

type FilesState = {
  files: Record<string, FileItem>;
  folders: Record<string, FolderItem>;
  importBlobs: (blobs: File[], folderId?: string | null) => Promise<void>;
};

export const useFilesStore = create<FilesState>()(
  persist(
    (set, get) => ({
      files: {},
      folders: {},
      async importBlobs(blobs, folderId = null) {
        const convert = (file: File) =>
          new Promise<FileItem>((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: uid(),
                name: file.name,
                size: file.size,
                type: file.type || "application/octet-stream",
                createdAt: new Date().toISOString(),
                folderId,
                version: 1,
                dataUrl: reader.result as string,
              });
            reader.readAsDataURL(file);
          });

        const items = await Promise.all(blobs.map(convert));
        const map = { ...get().files };
        items.forEach((it) => (map[it.id] = it));
        set({ files: map });
      },
    }),
    { name: "tasks-files-state" }
  )
);
