import {
  Anchor,
  Banknote,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  Folder,
  LayoutTemplate,
  Ship,
  Stamp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { DocumentCategory } from "@/lib/vessels/types";

export const CATEGORY_ICON: Record<DocumentCategory, LucideIcon> = {
  vessel: Ship,
  customs: Stamp,
  port: Anchor,
  crew: Users,
  finance: Banknote,
  template: LayoutTemplate,
  other: Folder,
};

/** Message key under documents.kinds — the human name for screen readers and tooltips */
export type FileKindId = "pdf" | "word" | "sheet" | "image" | "text" | "file";

export interface FileKind {
  /** short badge text, e.g. PDF / XLSX */
  label: string;
  kind: FileKindId;
  icon: LucideIcon;
  tile: string;
}

function extOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

/** Colour comes from tokens and is always paired with an icon + extension label */
export function fileKind(mime: string, fileName: string): FileKind {
  const ext = extOf(fileName);
  const label = (ext || "file").slice(0, 4).toUpperCase();
  if (mime === "application/pdf" || ext === "pdf") {
    return { label: "PDF", kind: "pdf", icon: FileText, tile: "bg-bad/10 text-bad ring-bad/20" };
  }
  if (/word|msword/.test(mime) || ext === "doc" || ext === "docx") {
    return { label, kind: "word", icon: FileText, tile: "bg-primary/10 text-primary ring-primary/20" };
  }
  if (/sheet|excel|csv/.test(mime) || ["xls", "xlsx", "csv"].includes(ext)) {
    return { label, kind: "sheet", icon: FileSpreadsheet, tile: "bg-ok/10 text-ok ring-ok/20" };
  }
  if (mime.startsWith("image/")) {
    return { label, kind: "image", icon: FileImage, tile: "bg-stage-roads/10 text-stage-roads ring-stage-roads/20" };
  }
  if (mime.startsWith("text/") || ext === "txt") {
    return { label, kind: "text", icon: FileType, tile: "bg-muted text-muted-foreground ring-border" };
  }
  return { label, kind: "file", icon: FileText, tile: "bg-muted text-muted-foreground ring-border" };
}
