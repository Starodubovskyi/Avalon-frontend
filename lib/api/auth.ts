"use client";

import api, { setTokens, clearAuth, ensureAccessToken } from "./client";

export type RegisterPayload = {
  email: string;
  password: string;
  [key: string]: any;
};

export type AuthResponse = {
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
  refreshToken?: string;
  refresh_token?: string;
  tokenExpires?: number;
  expiresIn?: number;
  exp?: number;
  user?: any;
  data?: any;
};

const COOKIE_MODE =
  (process.env.NEXT_PUBLIC_AUTH_COOKIE || "").toString().toLowerCase() ===
  "true";

function env(path: string | undefined, fallback: string) {
  const p = (path || "").trim();
  return p.startsWith("/") ? p : fallback;
}

function pickToken(d: any) {
  const x = d?.data ?? d ?? {};
  const token =
    x.token || x.accessToken || x.access_token || x.jwt || undefined;
  const refresh = x.refreshToken || x.refresh_token || undefined;
  const exp = x.tokenExpires ?? x.expiresIn ?? x.exp ?? 0;
  const user = x.user ?? x.profile ?? x.account ?? null;
  return { token, refreshToken: refresh, tokenExpires: exp, user };
}

async function postFirst<T = any>(
  paths: string[],
  body: any,
  opts?: { withCredentials?: boolean }
) {
  let lastErr: any = null;
  for (const p of paths) {
    try {
      const res = await api.post<T>(p, body, {
        withCredentials: opts?.withCredentials ?? COOKIE_MODE,
      });
      return res.data as any;
    } catch (e: any) {
      if (e?.response?.status !== 404) throw e;
      lastErr = e;
    }
  }
  throw lastErr ?? new Error(`No matching endpoint among: ${paths.join(", ")}`);
}

async function getFirst<T = any>(
  paths: string[],
  opts?: { withCredentials?: boolean }
) {
  let lastErr: any = null;
  for (const p of paths) {
    try {
      const res = await api.get<T>(p, {
        withCredentials: opts?.withCredentials ?? COOKIE_MODE,
      });
      return res.data as any;
    } catch (e: any) {
      if (e?.response?.status !== 404) throw e;
      lastErr = e;
    }
  }
  throw lastErr ?? new Error(`No matching endpoint among: ${paths.join(", ")}`);
}

const REGISTER_CANDIDATES = [
  env(process.env.NEXT_PUBLIC_AUTH_REGISTER, "/auth/register"),
  "/auth/email/register",
  "/auth/local/register",
  "/users/register",
  "/register",
];

const LOGIN_CANDIDATES = [
  env(process.env.NEXT_PUBLIC_AUTH_LOGIN, "/auth/email/login"),
  "/auth/login",
  "/auth/local/login",
  "/login",
];

const ME_CANDIDATES = [
  env(process.env.NEXT_PUBLIC_AUTH_ME, "/auth/me"),
  "/users/me",
  "/users/profile",
  "/users/current",
];

export async function authLogin(payload: { email: string; password: string }) {
  const raw = await postFirst<AuthResponse>(LOGIN_CANDIDATES, payload);
  const { token, refreshToken, tokenExpires } = pickToken(raw);
  if (token) setTokens(token, refreshToken ?? "", tokenExpires ?? 0);

  const me = await authMe().catch(() => null);
  if (me) return me;

  if (COOKIE_MODE) {
    const me2 = await authMe().catch(() => null);
    if (me2) return me2;
  }
  throw new Error("Login failed: no profile");
}

export async function authRegister(payload: RegisterPayload) {
  const raw = await postFirst<AuthResponse>(REGISTER_CANDIDATES, payload);
  const { token, refreshToken, tokenExpires } = pickToken(raw);
  if (token) setTokens(token, refreshToken ?? "", tokenExpires ?? 0);

  const me = await authMe().catch(() => null);
  if (me) return me;

  await authLogin({ email: payload.email, password: payload.password });
  return await authMe();
}

export async function authMe<T = any>() {
  if (!COOKIE_MODE) {
    await ensureAccessToken();
  }
  const me = await getFirst<T>(ME_CANDIDATES);
  return me;
}

export async function authLogout() {
  try {
    await api.post("/auth/logout").catch(() => {});
  } finally {
    clearAuth();
  }
}

export const AuthApi = {
  login: authLogin,
  register: authRegister,
  me: authMe,
  logout: authLogout,
};
