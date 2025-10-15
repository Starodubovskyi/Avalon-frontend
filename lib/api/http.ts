"use client";

import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || "/api/v1";

export const http = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

export function toErrorMessage(e: any): string {
  if (e?.response?.data?.message) {
    return Array.isArray(e.response.data.message)
      ? e.response.data.message.join("\n")
      : String(e.response.data.message);
  }
  if (e?.message === "Network Error") return "Network Error";
  return e?.message || "Unexpected error";
}
