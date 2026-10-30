"use client";

import { useState } from "react";
import { FileUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVessels } from "@/lib/vessels/hooks";
import { CATEGORY_LABEL, DOCUMENT_CATEGORIES, type DocumentCategory } from "@/lib/vessels/types";
import { ErrorBlock, LoadingBlock, PageHeader, Panel, SelectInput, TextInput } from "../ui/primitives";
import { DocumentList } from "./DocumentList";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { useDocuments } from "./useDocuments";

export function DocumentsView() {
  const [category, setCategory] = useState<DocumentCategory | "">("");
  const [vesselId, setVesselId] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: vessels } = useVessels("all");
  const { data, error, isLoading, mutate } = useDocuments({
    category: category || undefined,
    vesselId: vesselId || undefined,
    search: search.trim() || undefined,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Documents"
        subtitle="Shared library for the team: vessel papers, customs, port forms and templates."
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow hover:brightness-110"
          >
            <FileUp className="h-4 w-4" /> Upload
          </button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:flex-wrap">
          {(["", ...DOCUMENT_CATEGORIES] as const).map((c) => (
            <button
              key={c || "all"}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium",
                category === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
              )}
            >
              {c ? CATEGORY_LABEL[c] : "All"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title" className="pl-9" aria-label="Search documents" />
          </div>
          <SelectInput value={vesselId} onChange={(e) => setVesselId(e.target.value)} className="w-44" aria-label="Vessel">
            <option value="">All vessels</option>
            {(vessels ?? []).map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </SelectInput>
        </div>
      </div>

      {error ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      <Panel bodyClassName="py-1">
        {isLoading && !data ? <LoadingBlock label="Loading documents…" /> : <DocumentList documents={data ?? []} />}
      </Panel>

      <UploadDocumentDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
