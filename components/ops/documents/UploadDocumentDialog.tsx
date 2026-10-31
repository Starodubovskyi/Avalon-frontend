"use client";

import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { CloudUpload, RefreshCw, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocumentsApi } from "@/lib/api/documents";
import { extractAuthError } from "@/lib/api/auth";
import { useVessels } from "@/lib/vessels/hooks";
import { fmtBytes } from "@/lib/vessels/format";
import { CATEGORY_LABEL, DOCUMENT_CATEGORIES, type DocumentCategory } from "@/lib/vessels/types";
import { btn, Field, SelectInput, Spinner, TextArea, TextInput } from "../ui/primitives";
import { fileKind } from "./docMeta";
import { useRefreshDocuments } from "./useDocuments";

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png";
/** Matches the server limit on Vercel (request bodies over ~4.5 MB are rejected) */
const MAX_BYTES = 4 * 1024 * 1024;

function SelectedFile({ file, onReplace, onRemove }: { file: File; onReplace: () => void; onRemove: () => void }) {
  const kind = fileKind(file.type, file.name);
  const Icon = kind.icon;
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-muted/40 p-3">
      <span className={cn("flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ring-1 ring-inset", kind.tile)}>
        <Icon className="h-5 w-5" aria-hidden />
        <span className="mt-0.5 text-[9px] font-bold leading-none">{kind.label}</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold" title={file.name}>{file.name}</p>
        <p className="tabular text-xs text-muted-foreground">{kind.name} · {fmtBytes(file.size)}</p>
      </div>
      <button type="button" onClick={onReplace} className={btn.icon} aria-label="Choose another file" title="Replace">
        <RefreshCw className="h-4 w-4" />
      </button>
      <button type="button" onClick={onRemove} className={cn(btn.icon, "hover:bg-bad/10 hover:text-bad")} aria-label="Remove file" title="Remove">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  vesselId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vesselId?: string;
}) {
  const refresh = useRefreshDocuments();
  const { data: vessels } = useVessels("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>(vesselId ? "vessel" : "other");
  const [vessel, setVessel] = useState(vesselId ?? "");
  const [notes, setNotes] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFile(null);
      setTitle("");
      setNotes("");
      setError(null);
      setVessel(vesselId ?? "");
      setCategory(vesselId ? "vessel" : "other");
    }
  }, [open, vesselId]);

  /** Server codes → wording an agent can act on */
  function uploadErrorText(err: unknown): string {
    const status = axios.isAxiosError(err) ? err.response?.status : undefined;
    const msg = extractAuthError(err);
    if (status === 503 || /documentsStorageNotConfigured/.test(msg)) {
      return "Document storage is not connected on this server yet. Ask the administrator to configure it.";
    }
    if (status === 413 || /fileTooLarge/.test(msg)) {
      return "The file is too large for the server. Try a file under 4 MB or compress the PDF.";
    }
    if (/cantUploadFileType/.test(msg)) return "This file type is not allowed.";
    return msg;
  }

  function pick(f: File | undefined) {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPT.split(",").includes(`.${ext}`)) {
      setError("Allowed: PDF, Word, Excel, CSV, TXT, JPG, PNG");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File is larger than 4 MB — compress the PDF or split it");
      return;
    }
    setError(null);
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave(e: DragEvent) {
    if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
    setDragging(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await DocumentsApi.upload({ file, title: title.trim(), category, vesselId: vessel || null, notes: notes.trim() || null });
      await refresh();
      toast.success("Document uploaded");
      onOpenChange(false);
    } catch (err) {
      setError(uploadErrorText(err));
    } finally {
      setBusy(false);
    }
  }

  const browse = () => inputRef.current?.click();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] w-[calc(100%-1.5rem)] max-w-lg gap-0 overflow-y-auto rounded-2xl bg-card p-0 shadow-elevated sm:rounded-2xl">
        <div className="flex items-start gap-3 border-b px-6 pb-4 pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CloudUpload className="h-5 w-5" />
          </span>
          <DialogHeader className="min-w-0 space-y-1 pr-6 text-left">
            <DialogTitle className="font-display text-lg font-bold">Upload document</DialogTitle>
            <DialogDescription>Visible to Avalon staff only. PDF, Word, Excel, images — up to 4 MB.</DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} noValidate>
          <div className="space-y-4 px-6 py-5">
            <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
              {file && !dragging ? (
                <SelectedFile file={file} onReplace={browse} onRemove={() => setFile(null)} />
              ) : (
                <button
                  type="button"
                  onClick={browse}
                  className={cn(
                    "group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-9 text-center transition",
                    "bg-gradient-to-b from-primary/[0.04] to-transparent focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
                    dragging ? "scale-[1.01] border-primary bg-primary/5" : "border-input hover:border-primary/50 hover:bg-accent/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-card transition",
                      dragging && "-translate-y-0.5 bg-primary text-primary-foreground",
                    )}
                  >
                    <CloudUpload className="h-7 w-7" aria-hidden />
                  </span>
                  <span className="text-sm">
                    <span className="font-semibold">{dragging ? "Release to attach" : "Drop a file here"}</span>
                    {dragging ? null : <span className="text-muted-foreground"> or <span className="font-semibold text-primary underline-offset-2 group-hover:underline">browse</span></span>}
                  </span>
                  <span className="text-xs text-muted-foreground">PDF · DOCX · XLSX · CSV · TXT · JPG · PNG — max 4 MB</span>
                </button>
              )}
              <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
            </div>

            <Field label="Title *">
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} placeholder="e.g. PDA — MV Aurora" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Category">
                <SelectInput value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)}>
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Vessel">
                <SelectInput value={vessel} onChange={(e) => setVessel(e.target.value)} disabled={!!vesselId}>
                  <option value="">— none —</option>
                  {(vessels ?? []).map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </SelectInput>
              </Field>
            </div>
            <Field label="Notes">
              <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} className="min-h-[72px]" placeholder="Optional — what is it, who needs it" />
            </Field>

            {error ? <p role="alert" className="rounded-xl border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">{error}</p> : null}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => onOpenChange(false)} className={btn.secondary}>
              Cancel
            </button>
            <button type="submit" disabled={busy || !file || !title.trim()} className={btn.primary}>
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <CloudUpload className="h-4 w-4" />}
              Upload
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
