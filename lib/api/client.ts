"use client";

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const LS = {
  token: "access_token",
  refresh: "refresh_token",
  expires: "token_expires",
} as const;

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
const baseURL = RAW_BASE.replace(/\/+$/, "");
const USE_COOKIES =
  String(process.env.NEXT_PUBLIC_AUTH_COOKIE || "").toLowerCase() === "true";

const api = axios.create({
  baseURL,
  withCredentials: USE_COOKIES,
  timeout: 15000,
});

function setAuthHeader(cfg: AxiosRequestConfig, token: string) {
  const clean = token.replace(/^Bearer\s+/i, "");
  cfg.headers = {
    ...(cfg.headers || {}),
    Authorization: `Bearer ${clean}`,
  };
}

function setDefaultAuthHeader(token?: string) {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }
  const clean = token.replace(/^Bearer\s+/i, "");
  api.defaults.headers.common.Authorization = `Bearer ${clean}`;
}

const AUTH_SKIP_RE =
  /\/auth\/(?:(?:email|local)\/)?(?:login|register|refresh)$/i;
const shouldSkipAuth = (url?: string) => !!url && AUTH_SKIP_RE.test(url || "");

const isPublicPage = () => {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return (
    p === "/" ||
    p === "/auth" ||
    p.startsWith("/auth/") ||
    /^\/login(\/|$)/.test(p)
  );
};

export function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS.token) || "";
}
export function getRefreshToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS.refresh) || "";
}

export function setTokens(
  accessToken: string,
  refreshToken?: string,
  tokenExpires?: number,
) {
  if (typeof window === "undefined") return;

  if (accessToken) localStorage.setItem(LS.token, accessToken);
  if (refreshToken) localStorage.setItem(LS.refresh, refreshToken);
  if (typeof tokenExpires !== "undefined")
    localStorage.setItem(LS.expires, String(tokenExpires));

  setDefaultAuthHeader(accessToken);

  try {
    localStorage.setItem("auth:ts", String(Date.now()));
  } catch {
    /* ignore quota */
  }
  window.dispatchEvent(new Event("authchange"));
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LS.token);
    localStorage.removeItem(LS.refresh);
    localStorage.removeItem(LS.expires);
    try {
      localStorage.setItem("auth:ts", String(Date.now()));
    } catch {
      /* ignore quota */
    }
    window.dispatchEvent(new Event("authchange"));
  }
  setDefaultAuthHeader(undefined);
}

api.interceptors.request.use((cfg) => {
  if (!shouldSkipAuth(cfg.url || "")) {
    const token = getAccessToken();
    if (token) setAuthHeader(cfg, token);
  }
  if (USE_COOKIES) cfg.withCredentials = true;
  return cfg;
});

let isRefreshing = false;
let waiters: Array<(t: string | null) => void> = [];
function notifyWaiters(token: string | null) {
  waiters.forEach((cb) => cb(token));
  waiters = [];
}

function pickRefreshedAccess(data: unknown): {
  accessToken: string;
  refreshToken: string;
  exp: number | undefined;
} | null {
  if (typeof data !== "object" || data === null) return null;
  const rec = data as Record<string, unknown>;
  const access =
    (typeof rec.token === "string" && rec.token) ||
    (typeof rec.accessToken === "string" && rec.accessToken) ||
    (typeof rec.access_token === "string" && rec.access_token) ||
    "";
  if (!access) return null;
  const refresh =
    (typeof rec.refreshToken === "string" && rec.refreshToken) ||
    (typeof rec.refresh_token === "string" && rec.refresh_token) ||
    "";
  const expRaw = rec.tokenExpires ?? rec.expiresIn ?? rec.expires_at;
  const exp = typeof expRaw === "number" ? expRaw : undefined;
  return { accessToken: access, refreshToken: refresh, exp };
}

async function doRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;

  try {
    const { data } = await axios.post(`${baseURL}/auth/refresh`, null, {
      headers: { Authorization: `Bearer ${rt}` },
      withCredentials: USE_COOKIES,
      validateStatus: () => true,
    });
    const picked = pickRefreshedAccess(data);
    if (picked) {
      setTokens(
        picked.accessToken,
        picked.refreshToken || rt,
        picked.exp,
      );
      return picked.accessToken;
    }
  } catch {
    /* try body refresh */
  }

  try {
    const { data } = await axios.post(
      `${baseURL}/auth/refresh`,
      { refreshToken: rt },
      {
        withCredentials: USE_COOKIES,
        validateStatus: () => true,
      },
    );
    const picked = pickRefreshedAccess(data);
    if (picked) {
      setTokens(
        picked.accessToken,
        picked.refreshToken || rt,
        picked.exp,
      );
      return picked.accessToken;
    }
  } catch {
    return null;
  }

  return null;
}

async function refreshTokens(): Promise<string | null> {
  if (isRefreshing) return new Promise((res) => waiters.push(res));
  isRefreshing = true;
  let nt: string | null = null;
  try {
    nt = await doRefresh();
    return nt;
  } finally {
    isRefreshing = false;
    notifyWaiters(nt);
  }
}

api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = (error?.config || {}) as AxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error?.response?.status ?? 0;
    const url = String(original?.url || "");

    if (status !== 401 || original._retry || shouldSkipAuth(url)) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (USE_COOKIES) {
      if (!isPublicPage() && typeof window !== "undefined") {
        window.location.assign("/auth");
      }
      return Promise.reject(error);
    }

    const newToken = await refreshTokens();
    if (newToken) {
      setAuthHeader(original, newToken);
      return api(original);
    }

    clearAuth();
    if (!isPublicPage() && typeof window !== "undefined") {
      window.location.assign("/auth");
    }
    return Promise.reject(error);
  },
);

export async function ensureAccessToken(): Promise<string | null> {
  const t = getAccessToken();
  if (t) {
    setDefaultAuthHeader(t);
    return t;
  }
  if (USE_COOKIES) return null;
  const nt = await refreshTokens();
  if (nt) setDefaultAuthHeader(nt);
  return nt ?? null;
}

export default api;
