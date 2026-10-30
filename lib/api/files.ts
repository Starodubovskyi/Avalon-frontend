"use client";

import axios from "axios";
import api, { ensureAccessToken } from "./client";
import { isAbortError } from "./map-points";

export type UploadedFile = {
  id: string;
  path: string;
};

const fileUrlById = new Map<string, string>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toClientFileUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      return `${url.pathname}${url.search}`;
    } catch {
      return path;
    }
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function rememberFileUrl(id: string, path: string): string {
  const url = toClientFileUrl(path);
  fileUrlById.set(id, url);
  return url;
}

export function getCachedFileUrl(id: string): string | null {
  return fileUrlById.get(id) ?? null;
}

function parseFilePayload(raw: unknown): UploadedFile | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" && raw.id.length > 0 ? raw.id : undefined;
  const path =
    typeof raw.path === "string" && raw.path.length > 0 ? raw.path : undefined;
  if (!id || !path) return null;
  return { id, path };
}

function parseUploadResponse(raw: unknown): UploadedFile {
  if (isRecord(raw) && "file" in raw) {
    const nested = parseFilePayload(raw.file);
    if (nested) return nested;
  }
  const flat = parseFilePayload(raw);
  if (flat) return flat;
  throw new Error("Invalid upload response");
}

function extractUploadError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (isRecord(data)) {
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }
      if (isRecord(data.errors) && typeof data.errors.file === "string") {
        return data.errors.file;
      }
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Upload failed";
}

export async function uploadFile(
  file: File,
  signal?: AbortSignal,
): Promise<UploadedFile> {
  await ensureAccessToken();

  const fd = new FormData();
  const ext = file.name?.split(".").pop() || file.type.split("/")[1] || "bin";
  const filename = file.name || `upload.${ext}`;
  fd.append("file", file, filename);

  try {
    const { data } = await api.post<unknown>("/files/upload", fd, { signal });
    const uploaded = parseUploadResponse(data);
    rememberFileUrl(uploaded.id, uploaded.path);
    return uploaded;
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new Error(extractUploadError(error));
  }
}

export async function getFileMeta(
  id: string,
  signal?: AbortSignal,
): Promise<UploadedFile> {
  await ensureAccessToken();
  const { data } = await api.get<unknown>(`/files/meta/${id}`, { signal });
  const parsed = parseFilePayload(data);
  if (!parsed) throw new Error("Invalid file response");
  rememberFileUrl(parsed.id, parsed.path);
  return parsed;
}

export const FilesApi = { uploadFile, getFileMeta };
