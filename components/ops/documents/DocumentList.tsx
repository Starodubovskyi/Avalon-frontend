"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, FileText, Ship, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DocumentsApi } from "@/lib/api/documents";
import { extractAuthError } from "@/lib/api/auth";
import { fmtBytes, fmtFull, fmtRelative } from "@/lib/vessels/format";
import { CATEGORY_LABEL, userName, type DocumentView } from "@/lib/vessels/types";
import { Avatar, btn, EmptyState, Spinner } from "../ui/primitives";
import { CATEGORY_ICON, fileKind } from "./docMeta";
import { useRefreshDocuments } from "./useDocuments";

function FileTile({ mime, fileName }: { mime: string; fileName: string }) {
  const kind = fileKind(mime, fileName);
  const Icon = kind.icon;
  return (
    <span
      className={cn("relative flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ring-1 ring-inset", kind.tile)}
      title={kind.name}
    >
      <Icon className="h-5 w-5" aria-hidden />
      <span className="mt-0.5 text-[9px] font-bold leading-none tracking-wide">{kind.label}</span>
      <span className="sr-only">{kind.name}</span>
    </span>
  );
}

export function DocumentList({
  documents,
  showVessel = true,
  emptyText = "Upload PDAs, crew lists, certificates, customs papers and templates.",
}: {
  documents: DocumentView[];
  showVessel?: boolean;
  emptyText?: string;
}) {
  const refresh = useRefreshDocuments();
  const [busy, setBusy] = useState<string | null>(null);

  async function download(doc: DocumentView) {
    setBusy(doc.id);
    try {
      await DocumentsApi.download(doc);
    } catch (e) {
      toast.error(extractAuthError(e));
    } finally {
      setBusy(null);
    }
  }

  async function remove(doc: DocumentView) {
    if (!window.confirm(`Delete “${doc.title}”? This cannot be undone from the portal.`)) return;
    setBusy(doc.id);
    try {
      await DocumentsApi.remove(doc.id);
      await refresh();
      toast.success("Document deleted");
    } catch (e) {
      toast.error(extractAuthError(e));
    } finally {
      setBusy(null);
    }
  }

  if (!documents.length) {
    return <EmptyState icon={<FileText className="h-7 w-7" />} title="No documents yet" text={emptyText} />;
  }

  return (
    <ul className="-mx-2 divide-y divide-border/70">
      {documents.map((doc) => {
        const CatIcon = CATEGORY_ICON[doc.category];
        const isBusy = busy === doc.id;
        const uploader = userName(doc.uploadedBy);
        return (
          <li key={doc.id} className="group flex items-center gap-3.5 rounded-xl px-2 py-3 transition-colors hover:bg-accent/40">
            <FileTile mime={doc.mimeType} fileName={doc.originalName} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" title={doc.title}>{doc.title}</p>
              <p className="truncate text-xs text-muted-foreground" title={doc.originalName}>
                {doc.originalName} · <span className="tabular">{fmtBytes(doc.size)}</span>
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md border bg-muted/60 px-1.5 py-0.5 font-medium text-foreground/80">
                  <CatIcon className="h-3 w-3" aria-hidden />
                  {CATEGORY_LABEL[doc.category]}
                </span>
                {showVessel && doc.vesselId ? (
                  <Link
                    href={`/vessels/${doc.vesselId}`}
                    className="inline-flex min-w-0 items-center gap-1 font-medium text-primary hover:underline"
                  >
                    <Ship className="h-3 w-3 shrink-0" aria-hidden />
                    <span className="truncate">{doc.vesselName}</span>
                  </Link>
                ) : null}
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Avatar name={uploader} className="h-5 w-5 text-[8px]" />
                  <span className="truncate">{uploader}</span>
                </span>
                <time dateTime={doc.createdAt} title={fmtFull(doc.createdAt)}>{fmtRelative(doc.createdAt)}</time>
              </div>
            </div>

            <div
              className={cn(
                "flex shrink-0 items-center gap-0.5 transition-opacity",
                !isBusy && "md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100",
              )}
            >
              {isBusy ? <Spinner className="mr-1 h-4 w-4" /> : null}
              <button
                type="button"
                onClick={() => void download(doc)}
                disabled={isBusy}
                className={cn(btn.icon, "hover:text-primary")}
                aria-label={`Download ${doc.title}`}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => void remove(doc)}
                disabled={isBusy}
                className={cn(btn.icon, "hover:bg-bad/10 hover:text-bad")}
                aria-label={`Delete ${doc.title}`}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
