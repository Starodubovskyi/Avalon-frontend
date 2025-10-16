"use client";

import {
  File,
  FileImage,
  FileText,
  Video,
  FileArchive,
  FileType,
  FileCode,
  FileSpreadsheet,
  FileAudio,
  File as FileGeneric,
  FileDiff,
} from "lucide-react";

export default function FileIcon({
  ext,
  type,
  className,
}: {
  ext: string;
  type: string;
  className?: string;
}) {
  const base = "h-5 w-5";
  let Icon = FileGeneric;
  let tone = "text-gray-500";
  if (type === "image") {
    Icon = FileImage;
    tone = "text-blue-500";
  } else if (type === "pdf") {
    Icon = FileText;
    tone = "text-red-500";
  } else if (type === "doc") {
    if (["xls", "xlsx", "csv"].includes(ext)) {
      Icon = FileSpreadsheet;
      tone = "text-emerald-500";
    } else if (["md", "txt", "rtf"].includes(ext)) {
      Icon = FileText;
      tone = "text-gray-600";
    } else {
      Icon = FileType;
      tone = "text-indigo-500";
    }
  } else if (type === "video") {
    Icon = Video;
    tone = "text-purple-500";
  } else if (["zip", "rar", "7z"].includes(ext)) {
    Icon = FileArchive;
    tone = "text-amber-500";
  } else if (
    [
      "js",
      "ts",
      "tsx",
      "py",
      "java",
      "go",
      "rb",
      "php",
      "c",
      "cpp",
      "rs",
      "sh",
      "json",
      "yml",
      "yaml",
    ].includes(ext)
  ) {
    Icon = FileCode;
    tone = "text-sky-500";
  } else if (["mp3", "wav", "aac", "flac", "ogg"].includes(ext)) {
    Icon = FileAudio;
    tone = "text-pink-500";
  } else if (["diff", "patch"].includes(ext)) {
    Icon = FileDiff;
    tone = "text-lime-500";
  }

  return <Icon className={`${base} ${tone} ${className || ""}`} />;
}
