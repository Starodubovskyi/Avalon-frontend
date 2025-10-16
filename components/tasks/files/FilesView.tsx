"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useFilesStore,
  type FileItem,
  type Folder as FolderRec,
} from "./useFilesStore";
import FilesToolbar from "./FilesToolbar";
import FileCard from "./FileCard";
import FileRow from "./FileRow";
import FilePreviewPanel from "./FilePreviewPanel";
import {
  ChevronRight,
  Folder as FolderIcon,
  MoreHorizontal,
  Download,
  MoveRight,
  Edit2,
  Trash2,
} from "lucide-react";
import TextPromptModal from "./modals/TextPromptModal";
import MoveToModal from "./modals/MoveToModal";
import ConfirmModal from "./modals/ConfirmModal";

export default function FilesView() {
  const store = useFilesStore();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [previewId, setPreviewId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const folderMenuRef = useRef<HTMLDivElement | null>(null);
  const [folderMenuFor, setFolderMenuFor] = useState<string | null>(null);
  const [folderMenuPos, setFolderMenuPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{
    type: "file" | "folder";
    id: string;
    name: string;
  } | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [overFolderId, setOverFolderId] = useState<string | null>(null);

  const allFiles = Object.values(store.files);
  const files = useMemo(() => {
    const inFolder = allFiles.filter(
      (f) => (store.currentFolderId ?? null) === (f.folderId ?? null)
    );
    const byStar = store.onlyStarred
      ? inFolder.filter((f) => f.starred)
      : inFolder;
    const byType =
      store.filterType === "all"
        ? byStar
        : byStar.filter((f) => f.type === store.filterType);
    const bySearch = store.search.trim()
      ? byType.filter((f) =>
          f.name.toLowerCase().includes(store.search.toLowerCase())
        )
      : byType;

    const arr = [...bySearch];
    arr.sort((a, b) => {
      const dir = store.sortDir === "asc" ? 1 : -1;
      if (store.sortBy === "name") return a.name.localeCompare(b.name) * dir;
      if (store.sortBy === "size") return (a.size - b.size) * dir;
      return (
        (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) *
        dir
      );
    });
    return arr;
  }, [
    allFiles,
    store.currentFolderId,
    store.onlyStarred,
    store.filterType,
    store.search,
    store.sortBy,
    store.sortDir,
  ]);

  const foldersHere = useMemo(
    () =>
      Object.values(store.folders).filter(
        (f) =>
          (f.parentId ?? null) === (store.currentFolderId ?? null) &&
          f.id !== "root"
      ),
    [store.folders, store.currentFolderId]
  );

  const previewFile = previewId ? store.files[previewId] || null : null;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuFor(null);
      if (
        folderMenuRef.current &&
        !folderMenuRef.current.contains(e.target as Node)
      )
        setFolderMenuFor(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onDropContainer = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const externalFiles = Array.from(e.dataTransfer.files || []);
    if (externalFiles.length) {
      await store.uploadFiles(externalFiles);
      return;
    }
  };

  const selectedIds = Object.entries(selected)
    .filter(([_, v]) => v)
    .map(([id]) => id);

  const breadcrumb = useMemo(() => {
    const chain: FolderRec[] = [];
    let curr = store.currentFolderId
      ? store.folders[store.currentFolderId]
      : null;
    while (curr) {
      chain.unshift(curr);
      curr = curr.parentId ? store.folders[curr.parentId] : null;
    }
    return chain;
  }, [store.currentFolderId, store.folders]);

  const handleDropOnFolder = async (
    e: React.DragEvent,
    folderId: string | null
  ) => {
    e.preventDefault();
    setOverFolderId(null);
    const external = Array.from(e.dataTransfer.files || []);
    if (external.length) {
      await store.uploadFiles(external, folderId);
      return;
    }
    const data = e.dataTransfer.getData("application/x-files-ids");
    if (data) {
      try {
        const ids: string[] = JSON.parse(data);
        store.moveItems(ids, folderId);
        setSelected({});
      } catch {}
    }
  };

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] ${
        dragOver ? "ring-2 ring-violet-400/50" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDropContainer}
    >
      <div className="mb-3 flex flex-wrap items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
        <button
          className={`rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/10 ${
            overFolderId === "root" ? "ring-2 ring-violet-400/50" : ""
          }`}
          onClick={() => store.setCurrentFolder(null)}
          onDragOver={(e) => {
            e.preventDefault();
            setOverFolderId("root");
          }}
          onDragLeave={() => setOverFolderId(null)}
          onDrop={(e) => handleDropOnFolder(e, null)}
          title="Move here (root)"
        >
          All files
        </button>
        {breadcrumb.map((f) => (
          <span key={f.id} className="inline-flex items-center">
            <ChevronRight className="mx-1 h-4 w-4 text-gray-400" />
            <button
              className="rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/10"
              onClick={() => store.setCurrentFolder(f.id)}
            >
              {f.name}
            </button>
          </span>
        ))}
      </div>

      <FilesToolbar
        onUpload={async (fs) => {
          await store.uploadFiles(fs);
        }}
        onCreateFolder={() => setCreateFolderOpen(true)}
        selectedCount={selectedIds.length}
        onBulkDelete={() => {
          if (!selectedIds.length) return;
          store.deleteItems(selectedIds);
          setSelected({});
        }}
        onBulkMove={() => setMoveOpen(true)}
        onBulkStarToggle={() => {
          selectedIds.forEach((id) => store.toggleStar(id));
          setSelected({});
        }}
      />

      {foldersHere.length > 0 && (
        <>
          <div className="mt-4 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Folders
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {foldersHere.map((f) => (
              <div
                key={f.id}
                className={`group relative rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] ${
                  overFolderId === f.id ? "ring-2 ring-violet-400/50" : ""
                }`}
                onClick={() => store.setCurrentFolder(f.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverFolderId(f.id);
                }}
                onDragLeave={() => setOverFolderId(null)}
                onDrop={(e) => handleDropOnFolder(e, f.id)}
                title={f.name}
              >
                <div className="mb-2 flex items-center gap-2">
                  <FolderIcon className="h-5 w-5 text-amber-500" />
                  <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                    {f.name}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = (
                        e.currentTarget as HTMLButtonElement
                      ).getBoundingClientRect();
                      setFolderMenuPos({
                        x: rect.left,
                        y: rect.bottom + window.scrollY,
                      });
                      setFolderMenuFor(f.id);
                    }}
                    className="ml-auto hidden rounded-md p-1 text-gray-400 hover:text-gray-600 group-hover:block dark:text-gray-500 dark:hover:text-gray-300"
                    title="Folder menu"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Updated {new Date(f.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-4">
        {store.viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {files.map((f) => {
              const dragIds = selected[f.id] ? selectedIds : [f.id];
              return (
                <FileCard
                  key={f.id}
                  file={f}
                  selected={!!selected[f.id]}
                  onSelect={(chk) =>
                    setSelected((s) => ({ ...s, [f.id]: chk }))
                  }
                  onOpen={() => setPreviewId(f.id)}
                  onMenu={(el) => {
                    const rect = el.getBoundingClientRect();
                    setMenuPos({
                      x: rect.left,
                      y: rect.bottom + window.scrollY,
                    });
                    setMenuFor(f.id);
                  }}
                  dragIds={dragIds}
                />
              );
            })}
            {files.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-white/20 dark:text-gray-400">
                Drop files here or use “Upload”
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-white/10">
            <div className="grid grid-cols-[24px_1fr_140px_120px_80px_40px] items-center gap-3 border-b border-gray-100 px-3 py-2 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
              <div />
              <div>Name</div>
              <div>Updated</div>
              <div>Size</div>
              <div>Version</div>
              <div />
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/10">
              {files.map((f) => {
                const dragIds = selected[f.id] ? selectedIds : [f.id];
                return (
                  <FileRow
                    key={f.id}
                    file={f}
                    selected={!!selected[f.id]}
                    onSelect={(chk) =>
                      setSelected((s) => ({ ...s, [f.id]: chk }))
                    }
                    onOpen={() => setPreviewId(f.id)}
                    onMenu={(el) => {
                      const rect = el.getBoundingClientRect();
                      setMenuPos({
                        x: rect.left,
                        y: rect.bottom + window.scrollY,
                      });
                      setMenuFor(f.id);
                    }}
                    dragIds={dragIds}
                  />
                );
              })}
              {files.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Empty. Drop files here or use “Upload”.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {menuFor && (
        <div
          ref={menuRef}
          className="fixed z-[60] w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#111]"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          <button
            onClick={() => {
              const f = store.files[menuFor!];
              setRenameTarget({ type: "file", id: f.id, name: f.name });
              setMenuFor(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
          >
            <Edit2 className="h-4 w-4" /> Rename
          </button>
          <button
            onClick={() => {
              setMoveOpen(true);
              setMenuFor(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
          >
            <MoveRight className="h-4 w-4" /> Move to…
          </button>
          <button
            onClick={() => {
              const f = store.files[menuFor!];
              if (f?.dataUrl) {
                const a = document.createElement("a");
                a.href = f.dataUrl;
                a.download = f.name;
                a.click();
              }
              setMenuFor(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
          >
            <Download className="h-4 w-4" /> Download
          </button>
          <button
            onClick={() => {
              store.deleteItems([menuFor!]);
              setMenuFor(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}

      {folderMenuFor && (
        <div
          ref={folderMenuRef}
          className="fixed z-[60] w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#111]"
          style={{ left: folderMenuPos.x, top: folderMenuPos.y }}
        >
          <button
            onClick={() => {
              const fd = store.folders[folderMenuFor!];
              setRenameTarget({ type: "folder", id: fd.id, name: fd.name });
              setFolderMenuFor(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/10"
          >
            <Edit2 className="h-4 w-4" /> Rename
          </button>
          <button
            onClick={() => {
              setDeleteFolderId(folderMenuFor!);
              setFolderMenuFor(null);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}

      <FilePreviewPanel
        file={previewFile}
        open={!!previewId}
        onClose={() => setPreviewId(null)}
      />

      <TextPromptModal
        open={createFolderOpen}
        title="Create folder"
        label="Folder name"
        placeholder="e.g. Design assets"
        confirmText="Create"
        onConfirm={(name) => {
          store.createFolder(name);
          setCreateFolderOpen(false);
        }}
        onClose={() => setCreateFolderOpen(false)}
      />

      <TextPromptModal
        open={!!renameTarget}
        title={`Rename ${renameTarget?.type === "folder" ? "folder" : "file"}`}
        label="New name"
        initialValue={renameTarget?.name || ""}
        confirmText="Save"
        onConfirm={(name) => {
          if (!renameTarget) return;
          if (renameTarget.type === "folder")
            store.renameFolder(renameTarget.id, name);
          else store.renameFile(renameTarget.id, name);
          setRenameTarget(null);
        }}
        onClose={() => setRenameTarget(null)}
      />

      <MoveToModal
        open={moveOpen}
        ids={selectedIds.length ? selectedIds : menuFor ? [menuFor] : []}
        onClose={() => {
          setMoveOpen(false);
          setMenuFor(null);
          setSelected({});
        }}
      />

      <ConfirmModal
        open={!!deleteFolderId}
        title="Delete folder?"
        subtitle="Files inside will be moved to the root."
        onConfirm={() => {
          if (deleteFolderId) store.deleteFolder(deleteFolderId);
          setDeleteFolderId(null);
        }}
        onClose={() => setDeleteFolderId(null)}
      />
    </div>
  );
}
