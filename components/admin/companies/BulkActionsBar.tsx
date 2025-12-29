"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Trash2,
  Tag,
  GitMerge,
  X,
  Archive,
  PauseCircle,
} from "lucide-react";
import clsx from "clsx";

type Props = {
  selectedCount: number;
  onSelectAll: () => void;
  onClear: () => void;
  onPublish: () => void;
  onSuspend: () => void;
  onArchive: () => void;
  onAddTag: () => void;
  onRemoveTag: () => void;
  onDelete: () => void;
  onMerge: () => void;
};

const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

export default function BulkActionsBar(props: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="sticky top-4 z-20 mb-6 mx-auto max-w-4xl"
    >
      <div
        className="
        flex flex-col sm:flex-row items-center gap-4 p-4 pr-6 rounded-full
        bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-xl
        border border-gray-200/50 dark:border-white/10
        shadow-2xl shadow-blue-500/10
      "
      >
        <div
          className={clsx(
            "flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full text-white font-bold text-sm shadow-md",
            GRADIENT_BG
          )}
        >
          <span className="bg-white/20 px-2 py-0.5 rounded-full">
            {props.selectedCount}
          </span>
          <span>Selected</span>
          <button
            onClick={props.onClear}
            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            onClick={props.onPublish}
            className="rounded-full bg-green-50 text-green-700 hover:bg-green-100 border-none shadow-sm dark:bg-green-900/20 dark:text-green-300"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Publish
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={props.onSuspend}
            className="rounded-full border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            <PauseCircle className="mr-1.5 h-4 w-4" /> Suspend
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={props.onArchive}
            className="rounded-full border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
          >
            <Archive className="mr-1.5 h-4 w-4" /> Archive
          </Button>

          <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block" />

          <Button
            size="sm"
            variant="ghost"
            onClick={props.onAddTag}
            className="rounded-full hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/20 dark:text-blue-400"
          >
            <Tag className="mr-1.5 h-4 w-4" /> Tag
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={props.onMerge}
            className="rounded-full hover:bg-purple-50 text-purple-600 dark:hover:bg-purple-900/20 dark:text-purple-400"
          >
            <GitMerge className="mr-1.5 h-4 w-4" /> Merge
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={props.onDelete}
            className="rounded-full hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 dark:text-red-400"
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
