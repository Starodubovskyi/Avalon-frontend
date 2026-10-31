import { DOCUMENT_CATEGORIES, type DocumentView } from "@/lib/vessels/types";
import { nowIso, uuid } from "../ids";
import {
  TEAM_ROLES,
  byNewest,
  contains,
  created,
  invalid,
  isUuid,
  noContent,
  notFound,
  ok,
  requireRoles,
  uuidParam,
  type DemoRequest,
  type RouteDef,
} from "../http";
import { toUserRef } from "../presenters";
import type { DemoState, DocumentRow } from "../types";
import { documentBlob, forgetUpload, keepUpload } from "./documentFiles";

/** /documents — staff/admin only: list with filters, multipart upload, blob download, soft delete */

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  txt: "text/plain",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function toView(state: DemoState, d: DocumentRow): DocumentView {
  return {
    id: d.id,
    title: d.title,
    category: d.category,
    vesselId: d.vesselId,
    vesselName: d.vesselId ? state.vessels.find((v) => v.id === d.vesselId)?.name ?? null : null,
    originalName: d.originalName,
    mimeType: d.mimeType,
    size: d.size,
    notes: d.notes,
    uploadedBy: toUserRef(state, d.uploadedById),
    createdAt: d.createdAt,
  };
}

function list(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  const vesselId = req.query.vesselId?.trim() || undefined;
  const category = req.query.category?.trim() || undefined;
  const search = req.query.search?.trim() ?? "";
  if (vesselId && !isUuid(vesselId)) invalid({ vesselId: "vesselId must be a UUID" });
  if (category && !(DOCUMENT_CATEGORIES as readonly string[]).includes(category)) {
    invalid({ category: `category must be one of the following values: ${DOCUMENT_CATEGORIES.join(", ")}` });
  }
  const { state } = req;
  const rows = state.documents
    .filter((d) => !d.deletedAt)
    .filter((d) => (vesselId ? d.vesselId === vesselId : true))
    .filter((d) => (category ? d.category === category : true))
    .filter((d) => contains([d.title, d.originalName, toView(state, d).vesselName], search))
    .sort(byNewest)
    .slice(0, 500);
  return ok(rows.map((d) => toView(state, d)));
}

function formText(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function upload(req: DemoRequest) {
  const user = requireRoles(req, TEAM_ROLES);
  const form = req.form ?? new FormData();
  const title = formText(form, "title");
  const category = formText(form, "category");
  const vesselId = formText(form, "vesselId");
  const notes = formText(form, "notes");
  const errors: Record<string, string> = {};
  if (!title) errors.title = "title should not be empty";
  else if (title.length > 255) errors.title = "title must be shorter than or equal to 255 characters";
  if (!category || !(DOCUMENT_CATEGORIES as readonly string[]).includes(category)) {
    errors.category = `category must be one of the following values: ${DOCUMENT_CATEGORIES.join(", ")}`;
  }
  if (vesselId && !isUuid(vesselId)) errors.vesselId = "vesselId must be a UUID";
  if (notes && notes.length > 4000) errors.notes = "notes must be shorter than or equal to 4000 characters";
  if (Object.keys(errors).length) invalid(errors);

  const file = form.get("file");
  if (!(file instanceof Blob)) return invalid({ file: "selectFile" });
  const originalName = file instanceof File && file.name ? file.name : "upload";
  const ext = originalName.includes(".") ? originalName.split(".").pop()?.toLowerCase() ?? "" : "";
  const mimeType = MIME_BY_EXT[ext];
  if (!mimeType) invalid({ file: "cantUploadFileType" });
  if (file.size > MAX_FILE_SIZE) invalid({ file: "fileTooLarge" });
  if (vesselId && !req.state.vessels.some((v) => v.id === vesselId && !v.deletedAt)) invalid({ vesselId: "vesselNotExists" });

  const row: DocumentRow = {
    id: uuid(),
    title: title as string,
    category: category as DocumentRow["category"],
    vesselId: vesselId ?? null,
    originalName: originalName.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 255),
    mimeType,
    size: file.size,
    notes: notes ?? null,
    uploadedById: user.id,
    createdAt: nowIso(),
    deletedAt: null,
  };
  req.state.documents.push(row);
  keepUpload(row.id, file);
  return created(toView(req.state, row));
}

function findActive(req: DemoRequest): DocumentRow {
  const id = uuidParam(req);
  return req.state.documents.find((d) => d.id === id && !d.deletedAt) ?? notFound("Document not found");
}

function download(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  const doc = findActive(req);
  const blob = documentBlob(doc, req.state);
  return {
    status: 200,
    blob,
    headers: {
      "content-type": doc.mimeType,
      "content-length": String(blob.size),
      "content-disposition": `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
    },
  };
}

function remove(req: DemoRequest) {
  requireRoles(req, TEAM_ROLES);
  const doc = findActive(req);
  doc.deletedAt = nowIso();
  forgetUpload(doc.id);
  return noContent();
}

export const documentRoutes: RouteDef[] = [
  ["GET", "/documents", list],
  ["POST", "/documents", upload],
  ["GET", "/documents/:id/download", download],
  ["DELETE", "/documents/:id", remove],
];
