"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, FileImage, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DocumentsApi } from "@/lib/api/documents";
import { extractAuthError } from "@/lib/api/auth";
import { fmtBytes, fmtRelative } from "@/lib/vessels/format";
import { CATEGORY_LABEL, userName, type DocumentView } from "@/lib/vessels/types";
import { EmptyState, Spinner } from "../ui/primitives";
import { useRefreshDocuments } from "./useDocuments";

function DocIcon({ mime }: { mime: string }) {
  if (mime.startsWith("image/")) return <FileImage className="h-5 w-5 text-stage-roads" />;
  if (/sheet|excel|csv/.test(mime)) return <FileSpreadsheet className="h-5 w-5 text-ok" />;
  return <FileText className="h-5 w-5 text-primary" />;
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
    <ul className="divide-y">
      {documents.map((doc) => (
        <li key={doc.id} className="flex items-center gap-3 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <DocIcon mime={doc.mimeType} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" title={doc.originalName}>{doc.title}</p>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground/80">{CATEGORY_LABEL[doc.category]}</span>
              {showVessel && doc.vesselId ? (
                <Link href={`/vessels/${doc.vesselId}`} className="text-primary hover:underline">{doc.vesselName}</Link>
              ) : null}
              <span>{fmtBytes(doc.size)}</span>
              <span>· {userName(doc.uploadedBy)} · {fmtRelative(doc.createdAt)}</span>
            </p>
          </div>
          {busy === doc.id ? <Spinner className="h-4 w-4" /> : null}
          <button
            type="button"
            onClick={() => void download(doc)}
            disabled={busy === doc.id}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={`Download ${doc.title}`}
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void remove(doc)}
            disabled={busy === doc.id}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-bad/10 hover:text-bad"
            aria-label={`Delete ${doc.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
