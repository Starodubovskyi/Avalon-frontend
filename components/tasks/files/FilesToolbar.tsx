"use client";

import { useRef } from "react";
import { useFilesStore } from "./useFilesStore";
import {
  Upload,
  Grid,
  List,
  Star,
  StarOff,
  FolderPlus,
  ChevronDown,
  Filter,
} from "lucide-react";

export default function FilesToolbar({
  onUpload,
  onCreateFolder,
  selectedCount,
  onBulkDelete,
  onBulkMove,
  onBulkStarToggle,
}: {
  onUpload: (files: File[]) => void;
  onCreateFolder: () => void;
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkMove: () => void;
  onBulkStarToggle: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    search,
    setSearch,
    viewMode,
    setViewMode,
    filterType,
    setFilterType,
    onlyStarred,
    setOnlyStarred,
    sortBy,
    sortDir,
    setSort,
  } = useFilesStore();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files..."
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:bg-white/[0.02] dark:border-white/10 dark:text-white md:max-w-[340px]"
        />

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`rounded-xl border px-3 py-2 text-sm dark:border-white/10 ${
              onlyStarred
                ? "border-amber-300 text-amber-600 dark:text-amber-300"
                : "border-gray-200 text-gray-700 dark:text-gray-200"
            }`}
            title="Starred only"
          >
            {onlyStarred ? (
              <Star className="h-4 w-4 inline" />
            ) : (
              <StarOff className="h-4 w-4 inline" />
            )}{" "}
            <span className="ml-1">Starred</span>
          </button>

          <div className="relative">
            <select
              value={`${sortBy}:${sortDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split(":") as any;
                setSort(by, dir);
              }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
              title="Sort"
            >
              <option value="date:desc">Newest</option>
              <option value="date:asc">Oldest</option>
              <option value="name:asc">Name A→Z</option>
              <option value="name:desc">Name Z→A</option>
              <option value="size:asc">Size ↑</option>
              <option value="size:desc">Size ↓</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:bg-white/[0.02] dark:border-white/10 dark:text-white"
              title="Filter by type"
            >
              <option value="all">All types</option>
              <option value="image">Images</option>
              <option value="pdf">PDF</option>
              <option value="doc">Docs</option>
              <option value="video">Video</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <>
            <button
              onClick={onBulkMove}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
            >
              Move
            </button>
            <button
              onClick={onBulkStarToggle}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
            >
              Star/Unstar
            </button>
            <button
              onClick={onBulkDelete}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:bg-white/[0.04] dark:border-white/10 dark:hover:bg-red-500/10"
            >
              Delete
            </button>
          </>
        )}

        <button
          onClick={onCreateFolder}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:bg-white/[0.04] dark:border-white/10 dark:text-gray-200"
        >
          <FolderPlus className="mr-1 inline h-4 w-4" />
          New Folder
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) onUpload(files);
            e.currentTarget.value = "";
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black dark:bg-white dark:text-black"
        >
          <Upload className="mr-1 inline h-4 w-4" />
          Upload
        </button>

        <div className="ml-1 inline-flex rounded-xl border border-gray-200 p-1 dark:border-white/10">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-lg px-2 py-1 ${
              viewMode === "grid"
                ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                : "text-gray-600 dark:text-gray-300"
            }`}
            title="Grid"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-lg px-2 py-1 ${
              viewMode === "list"
                ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                : "text-gray-600 dark:text-gray-300"
            }`}
            title="List"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
