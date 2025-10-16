"use client";

import FileIcon from "./FileIcon";
import { useFilesStore, type FileItem } from "./useFilesStore";
import { MoreHorizontal, Star } from "lucide-react";

export default function FileRow({
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
      className={`grid grid-cols-[24px_1fr_140px_120px_80px_40px] items-center gap-3 px-3 py-2 ${
        selected ? "bg-violet-50/70 dark:bg-violet-400/10" : ""
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
      <div>
        <input
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300"
        />
      </div>
      <button
        onClick={onOpen}
        className="flex min-w-0 items-center gap-2 text-left"
      >
        <FileIcon ext={file.ext} type={file.type} />
        <span className="truncate text-sm text-gray-900 dark:text-gray-100">
          {file.name}
        </span>
      </button>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {new Date(file.updatedAt).toLocaleDateString()}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {formatSize(file.size)}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        v{file.version}
      </div>
      <div className="flex items-center justify-end gap-1">
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
  );
}

function formatSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
