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
    delete (api.defaults.headers.common as any).Authorization;
    return;
  }
  const clean = token.replace(/^Bearer\s+/i, "");
  (api.defaults.headers.common as any).Authorization = `Bearer ${clean}`;
}

const AUTH_SKIP_RE =
  /\/auth\/(?:(?:email|local)\/)?(?:login|register|refresh)$/i;
const shouldSkipAuth = (url?: string) => !!url && AUTH_SKIP_RE.test(url || "");

const isPublicPage = () => {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return p === "/" || /^\/login(\/|$)/.test(p) || /^\/register(\/|$)/.test(p);
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
  tokenExpires?: number
) {
  if (typeof window === "undefined") return;

  if (accessToken) localStorage.setItem(LS.token, accessToken);
  if (refreshToken) localStorage.setItem(LS.refresh, refreshToken);
  if (typeof tokenExpires !== "undefined")
    localStorage.setItem(LS.expires, String(tokenExpires));

  setDefaultAuthHeader(accessToken);

  try {
    localStorage.setItem("auth:ts", String(Date.now()));
  } catch {}
  window.dispatchEvent(new Event("authchange"));
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LS.token);
    localStorage.removeItem(LS.refresh);
    localStorage.removeItem(LS.expires);
    try {
      localStorage.setItem("auth:ts", String(Date.now()));
    } catch {}
  }
  setDefaultAuthHeader(undefined);
  window.dispatchEvent(new Event("authchange"));
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

async function doRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;

  try {
    const { data } = await axios.post(`${baseURL}/auth/refresh`, null, {
      headers: { Authorization: `Bearer ${rt}` },
      withCredentials: USE_COOKIES,
      validateStatus: () => true,
    });
    if (data && (data.token || data.accessToken || data.access_token)) {
      const at = data.token || data.accessToken || data.access_token || "";
      const newRt = data.refreshToken || data.refresh_token || rt;
      const exp = data.tokenExpires ?? data.expiresIn ?? data.expires_at;
      setTokens(at, newRt, exp);
      return at;
    }
  } catch {}

  try {
    const { data } = await axios.post(
      `${baseURL}/auth/refresh`,
      { refreshToken: rt },
      {
        withCredentials: USE_COOKIES,
        validateStatus: () => true,
      }
    );
    if (data && (data.token || data.accessToken || data.access_token)) {
      const at = data.token || data.accessToken || data.access_token || "";
      const newRt = data.refreshToken || data.refresh_token || rt;
      const exp = data.tokenExpires ?? data.expiresIn ?? data.expires_at;
      setTokens(at, newRt, exp);
      return at;
    }
  } catch {}

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
        window.location.assign("/login");
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
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
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
