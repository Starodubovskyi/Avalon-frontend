"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CloudUpload, FolderOpen, Layers, Search, Ship, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVessels } from "@/lib/vessels/hooks";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "@/lib/vessels/types";
import { btn, ErrorBlock, LoadingBlock, PageHeader, Panel, SelectInput, Spinner, TextInput } from "../ui/primitives";
import { CATEGORY_ICON } from "./docMeta";
import { DocumentList } from "./DocumentList";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { useDocuments } from "./useDocuments";

export function DocumentsView() {
  const t = useTranslations("documents");
  const [category, setCategory] = useState<DocumentCategory | "">("");
  const [vesselId, setVesselId] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: vessels } = useVessels("all");
  const { data, error, isLoading, isValidating, mutate } = useDocuments({
    category: category || undefined,
    vesselId: vesselId || undefined,
    search: search.trim() || undefined,
  });

  const filtered = Boolean(category || vesselId || search.trim());
  const count = data?.length ?? 0;

  function clearFilters() {
    setCategory("");
    setVesselId("");
    setSearch("");
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <button type="button" onClick={() => setOpen(true)} className={btn.primary}>
            <CloudUpload className="h-4 w-4" aria-hidden /> {t("upload.open")}
          </button>
        }
      />

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label={t("categoryLabel")}>
        {(["", ...DOCUMENT_CATEGORIES] as const).map((c) => {
          const Icon = c ? CATEGORY_ICON[c] : Layers;
          const active = category === c;
          return (
            <button
              key={c || "all"}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={active}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_6px_16px_-8px_hsl(var(--primary)/0.7)]"
                  : "bg-card text-foreground/80 shadow-card hover:border-primary/40 hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {c ? t(`categories.${c}`) : t("allCategories")}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-card sm:flex-row sm:items-center sm:p-4">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <TextInput
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("searchLabel")}
          />
        </div>
        <div className="relative sm:w-56">
          <Ship className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <SelectInput value={vesselId} onChange={(e) => setVesselId(e.target.value)} className="pl-9" aria-label={t("vesselFilter")}>
            <option value="">{t("allVessels")}</option>
            {(vessels ?? []).map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </SelectInput>
        </div>
        {filtered ? (
          <button type="button" onClick={clearFilters} className={cn(btn.ghost, "self-start sm:self-auto")}>
            <X className="h-4 w-4" aria-hidden /> {t("clear")}
          </button>
        ) : null}
      </div>

      {error ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}

      <Panel
        title={category ? t(`categories.${category}`) : t("panelAll")}
        description={data ? (filtered ? t("countFiltered", { count }) : t("count", { count })) : t("loading")}
        icon={<FolderOpen className="h-4 w-4" />}
        action={isValidating && data ? <Spinner className="h-4 w-4" /> : null}
        bodyClassName="pb-2"
      >
        {isLoading && !data ? <LoadingBlock label={t("loadingDocuments")} /> : (
          <DocumentList
            documents={data ?? []}
            emptyText={filtered ? t("emptyFiltered") : undefined}
          />
        )}
      </Panel>

      <UploadDocumentDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
