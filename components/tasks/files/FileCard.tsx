"use client";

import FileIcon from "./FileIcon";
import { useFilesStore, type FileItem } from "./useFilesStore";
import { MoreHorizontal, Star } from "lucide-react";

export default function FileCard({
  file,
  selected,
  onSelect,
  onOpen,
  onMenu,
  dragIds,
}: {
  file: FileItem;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onOpen: () => void;
  onMenu: (el: HTMLButtonElement) => void;
  dragIds: string[];
}) {
  const toggleStar = useFilesStore((s) => s.toggleStar);

  return (
    <div
      className={`group relative rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] ${
        selected ? "ring-2 ring-violet-400/60" : ""
      }`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "application/x-files-ids",
          JSON.stringify(dragIds)
        );
      }}
    >
      <div className="flex items-start gap-2">
        <input
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300"
        />
        <div className="min-w-0 flex-1">
          <button
            onClick={onOpen}
            className="flex items-center gap-2 text-left"
          >
            <FileIcon ext={file.ext} type={file.type} />
            <div className="truncate font-medium text-gray-900 dark:text-gray-100">
              {file.name}
            </div>
          </button>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formatSize(file.size)} • v{file.version} •{" "}
            {new Date(file.updatedAt).toLocaleDateString()}
          </div>

          {file.type === "image" && file.dataUrl && (
            <button
              onClick={onOpen}
              className="mt-2 block overflow-hidden rounded-lg border border-gray-100 dark:border-white/10"
            >
              <img
                src={file.dataUrl}
                alt={file.name}
                className="h-32 w-full object-cover"
              />
            </button>
          )}

          {file.tags && file.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {file.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-black/5 px-1.5 py-0.5 text-[11px] text-gray-700 dark:bg-white/10 dark:text-gray-200"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => toggleStar(file.id)}
            className={`rounded-md p-1 ${
              file.starred
                ? "text-amber-500"
                : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            }`}
            title={file.starred ? "Unstar" : "Star"}
          >
            <Star className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => onMenu(e.currentTarget)}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            title="More"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function formatSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
