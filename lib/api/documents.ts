"use client";

import api from "./client";
import type { DocumentCategory, DocumentView } from "@/lib/vessels/types";

export interface DocumentQuery {
  vesselId?: string;
  category?: DocumentCategory;
  search?: string;
}

export interface UploadDocumentInput {
  file: File;
  title: string;
  category: DocumentCategory;
  vesselId?: string | null;
  notes?: string | null;
}

export const DocumentsApi = {
  async list(query: DocumentQuery = {}): Promise<DocumentView[]> {
    const params = Object.fromEntries(
      Object.entries(query).filter(([, v]) => typeof v === "string" && v),
    );
    const { data } = await api.get<DocumentView[]>("/documents", { params });
    return data;
  },

  async upload(input: UploadDocumentInput): Promise<DocumentView> {
    const form = new FormData();
    form.append("file", input.file);
    form.append("title", input.title);
    form.append("category", input.category);
    if (input.vesselId) form.append("vesselId", input.vesselId);
    if (input.notes) form.append("notes", input.notes);
    const { data } = await api.post<DocumentView>("/documents", form, {
      timeout: 120_000,
    });
    return data;
  },

  /** Fetches with the Bearer token, then hands the blob to the browser */
  async download(doc: Pick<DocumentView, "id" | "originalName">): Promise<void> {
    const res = await api.get<Blob>(`/documents/${doc.id}/download`, {
      responseType: "blob",
      timeout: 120_000,
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.originalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};
