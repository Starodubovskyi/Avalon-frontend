"use client";

import { useState, useRef } from "react";
import Modal from "@/components/tasks/shared/Modal";
import { useFilesStore } from "../../store/store";
import { Upload, X } from "lucide-react";

export default function UploadFileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const importBlobs = useFilesStore((s) => s.importBlobs);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const onPick = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onPick(e.dataTransfer.files);
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 dark:bg-[#0f0f0f] dark:border-white/10">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          Upload files
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-white/15"
        >
          <Upload className="h-6 w-6 text-gray-400" />
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Drag & drop files here or
            <button
              className="ml-1 underline text-gray-900 dark:text-white"
              onClick={() => inputRef.current?.click()}
            >
              browse
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onPick(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4 max-h-48 overflow-y-auto space-y-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-white/10"
              >
                <div className="truncate">
                  <span className="text-gray-900 dark:text-gray-100">
                    {f.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {(f.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  className="rounded-md p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            disabled={files.length === 0}
            onClick={async () => {
              await importBlobs(files);
              onClose();
              setFiles([]);
            }}
            className="rounded-xl bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
          >
            Upload
          </button>
        </div>
      </div>
    </Modal>
  );
}
