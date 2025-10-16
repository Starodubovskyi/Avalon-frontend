import { cookies } from "next/headers";

const API_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api/v1"
).replace(/\/+$/, "");
const ACCESS_COOKIE = "avalon_access";

function serverAuthHeaders(init?: HeadersInit): HeadersInit {
  const h = new Headers(init as any);
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h as any;
}

export async function serverGet<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: serverAuthHeaders(init?.headers as any),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function serverPost<T = any>(
  path: string,
  body?: any,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    ...init,
    headers: serverAuthHeaders({
      "Content-Type": "application/json",
      ...(init?.headers as any),
    }),
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}
