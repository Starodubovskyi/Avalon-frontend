"use client";
import api, { ensureAccessToken } from "./client";

export type UploadedFile = {
  id: number;
  url?: string | null;
  path?: string | null;
  filename?: string;
  mimetype?: string;
  size?: number;
};

export async function uploadFile(file: File): Promise<UploadedFile> {
  await ensureAccessToken();

  const fd = new FormData();
  const ext = file.name?.split(".").pop() || file.type.split("/")[1] || "bin";
  const filename = file.name || `upload.${ext}`;
  fd.append("file", file, filename);

  try {
    const { data } = await api.post<UploadedFile>("/files/upload", fd);
    return data;
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || "Upload failed";
    console.error("Upload error:", e?.response?.data || e);
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
}

export const FilesApi = { uploadFile };
