"use client";

import Modal from "@/components/tasks/shared/Modal";
import { useRef, useState } from "react";
import { useFilesStore, type FileItem } from "./useFilesStore";
import {
  X,
  Star,
  Tag,
  Download,
  Edit2,
  Save,
  Trash2,
  UploadCloud,
  History,
} from "lucide-react";

export default function FilePreviewPanel({
  file,
  open,
  onClose,
}: {
  file: FileItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const store = useFilesStore();
  const [name, setName] = useState(file?.name || "");
  const [tag, setTag] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!open || !file) return null;

  const dirty = name.trim() !== file.name;

  const handleDownload = () => {
    if (file.dataUrl) {
      const a = document.createElement("a");
      a.href = file.dataUrl;
      a.download = file.name;
      a.click();
    }
  };

  return (
    <Modal side="right" onClose={onClose} className="max-w-[720px]">
      <div className="ml-auto flex h-full w-full max-w-[720px] flex-col border-l border-gray-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0f0f0f]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-[#0f0f0f]/80">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
            File preview
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
            />
            <button
              onClick={() => store.toggleStar(file.id)}
              className={`rounded-lg p-2 ${
                file.starred
                  ? "text-amber-500"
                  : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              }`}
              title={file.starred ? "Unstar" : "Star"}
            >
              <Star className="h-5 w-5" />
            </button>
            <button
              onClick={() => dirty && store.renameFile(file.id, name.trim())}
              disabled={!dirty}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-200 dark:hover:bg-white/10"
              title="Save name"
            >
              <Save className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
            {file.type === "image" && file.dataUrl && (
              <img
                src={file.dataUrl}
                alt={file.name}
                className="max-h-[380px] w-full object-contain bg-black/5 dark:bg-white/5"
              />
            )}
            {file.type === "pdf" && file.dataUrl && (
              <iframe
                src={file.dataUrl}
                className="h-[380px] w-full bg-black/5 dark:bg-white/5"
              />
            )}
            {file.type === "doc" && file.dataUrl && (
              <iframe
                src={file.dataUrl}
                className="h-[380px] w-full bg-black/5 dark:bg-white/5"
              />
            )}
            {!file.dataUrl && (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No preview available
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-3 text-sm dark:border-white/10">
              <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Details
              </div>
              <div className="space-y-1 text-gray-700 dark:text-gray-200">
                <div>Name: {file.name}</div>
                <div>Type: {file.mime}</div>
                <div>Size: {formatSize(file.size)}</div>
                <div>Version: v{file.version}</div>
                <div>Updated: {new Date(file.updatedAt).toLocaleString()}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleDownload}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
                >
                  <Download className="mr-1 inline h-4 w-4" />
                  Download
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) store.replaceFileVersion(file.id, f);
                    e.currentTarget.value = "";
                  }}
                />
                <button
                  onClick={() => inputRef.current?.click()}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
                >
                  <UploadCloud className="mr-1 inline h-4 w-4" />
                  Replace (new version)
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-3 text-sm dark:border-white/10">
              <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                Tags
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
                />
                <button
                  onClick={() => {
                    if (!tag.trim()) return;
                    store.addTag(file.id, tag.trim());
                    setTag("");
                  }}
                  className="rounded-xl bg-gray-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-black"
                >
                  Add
                </button>
              </div>
              {file.tags && file.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {file.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-lg bg-black/5 px-2 py-0.5 text-xs text-gray-700 dark:bg-white/10 dark:text-gray-200"
                    >
                      <Tag className="h-3 w-3" />
                      {t}
                      <button
                        onClick={() => store.removeTag(file.id, t)}
                        className="rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/20"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {file.history.length > 0 && (
            <div className="mt-4 rounded-xl border border-gray-200 p-3 text-sm dark:border-white/10">
              <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <History className="h-4 w-4" /> Version history
              </div>
              <div className="divide-y divide-gray-100 dark:divide-white/10">
                {file.history.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="text-gray-700 dark:text-gray-200">
                      {v.name} — {formatSize(v.size)} —{" "}
                      {new Date(v.createdAt).toLocaleString()}
                    </div>
                    {v.dataUrl && (
                      <button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = v.dataUrl!;
                          a.download = v.name;
                          a.click();
                        }}
                        className="rounded-lg px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                      >
                        Download
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-10 border-t border-gray-100 bg-white/80 p-3 backdrop-blur dark:border-white/10 dark:bg-[#0f0f0f]/80">
          <div className="flex justify-end">
            <button
              onClick={() => {
                store.deleteItems([file.id]);
                onClose();
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:bg-white/[0.04] dark:border-white/10 dark:hover:bg-red-500/10"
            >
              <Trash2 className="mr-1 inline h-4 w-4" />
              Delete file
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function formatSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
