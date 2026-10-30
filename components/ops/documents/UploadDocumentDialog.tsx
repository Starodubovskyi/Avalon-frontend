"use client";

import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { FileUp, X } from "lucide-react";
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
import { Field, SelectInput, Spinner, TextArea, TextInput } from "../ui/primitives";
import { useRefreshDocuments } from "./useDocuments";

const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png";
const MAX_BYTES = 20 * 1024 * 1024;

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

  function pick(f: File | undefined) {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ACCEPT.split(",").includes(`.${ext}`)) {
      setError("Allowed: PDF, Word, Excel, CSV, TXT, JPG, PNG");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File is larger than 20 MB");
      return;
    }
    setError(null);
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
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
      setError(extractAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload document</DialogTitle>
          <DialogDescription>Visible to Avalon staff only. PDF, Word, Excel, images — up to 20 MB.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
              dragging ? "border-primary bg-primary/5" : "hover:bg-accent/50",
            )}
          >
            <FileUp className="h-7 w-7 text-muted-foreground" />
            {file ? (
              <div className="flex min-w-0 max-w-full items-center gap-2 text-sm">
                <span className="min-w-0 break-all font-medium">{file.name}</span>
                <span className="shrink-0 text-muted-foreground">{fmtBytes(file.size)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="rounded p-0.5 text-muted-foreground hover:bg-accent"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Drop a file here or click to choose</p>
            )}
            <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          </div>

          <Field label="Title *">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
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
            <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} className="min-h-[60px]" />
          </Field>

          {error ? <p role="alert" className="rounded-lg border border-bad/30 bg-bad/5 px-3 py-2 text-sm text-bad">{error}</p> : null}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-accent">
              Cancel
            </button>
            <button type="submit" disabled={busy || !file || !title.trim()} className="flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50">
              {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : null}
              Upload
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
