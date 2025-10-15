export function apiOrigin(): string {
  const api = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  const m = api.match(/^(https?:\/\/[^/]+)/i);
  return m ? m[1] : "";
}

export function toAbsoluteFileUrl(u?: string | null): string | null {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  const base = (process.env.NEXT_PUBLIC_FILES_BASE || apiOrigin()).replace(
    /\/+$/,
    ""
  );
  const path = u.startsWith("/") ? u : `/${u}`;
  return `${base}${path}`;
}
