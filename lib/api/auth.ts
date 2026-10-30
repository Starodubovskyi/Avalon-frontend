"use client";

import axios from "axios";
import api, { setTokens, clearAuth, ensureAccessToken } from "./client";
import type {
  AuthUser,
  LoginResponse,
  RegisterPayload,
} from "@/lib/domain/map-point";

export type { AuthUser, LoginResponse, RegisterPayload };

const COOKIE_MODE =
  (process.env.NEXT_PUBLIC_AUTH_COOKIE || "").toString().toLowerCase() ===
  "true";

function envPath(path: string | undefined, fallback: string): string {
  const p = (path || "").trim();
  return p.startsWith("/") ? p : fallback;
}

const LOGIN_PATH = envPath(
  process.env.NEXT_PUBLIC_AUTH_LOGIN,
  "/auth/email/login",
);
const REGISTER_PATH = envPath(
  process.env.NEXT_PUBLIC_AUTH_REGISTER,
  "/auth/email/register",
);
const ME_PATH = envPath(process.env.NEXT_PUBLIC_AUTH_ME, "/auth/me");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapData(raw: unknown): unknown {
  if (isRecord(raw) && "data" in raw && isRecord(raw.data)) return raw.data;
  return raw;
}

function pickNonEmptyString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

function parseAuthUser(raw: unknown): AuthUser | null {
  const src = unwrapData(raw);
  if (!isRecord(src)) return null;
  const id = src.id;
  if (typeof id !== "number" && typeof id !== "string") return null;
  return {
    id,
    email: typeof src.email === "string" ? src.email : null,
    firstName: typeof src.firstName === "string" ? src.firstName : null,
    lastName: typeof src.lastName === "string" ? src.lastName : null,
    role: parseRole(src.role),
  };
}

function parseRole(raw: unknown): AuthUser["role"] {
  if (!isRecord(raw)) return null;
  const id = Number(raw.id);
  if (!Number.isFinite(id)) return null;
  return { id, name: typeof raw.name === "string" ? raw.name : null };
}

function parseLoginResponse(raw: unknown): LoginResponse | null {
  const x = unwrapData(raw);
  if (!isRecord(x)) return null;
  const token = pickNonEmptyString(x.token, x.accessToken, x.access_token);
  if (!token) return null;
  const refreshToken =
    pickNonEmptyString(x.refreshToken, x.refresh_token) ?? "";
  const expRaw = x.tokenExpires ?? x.expiresIn ?? x.exp;
  const tokenExpires = typeof expRaw === "number" ? expRaw : 0;
  const user = parseAuthUser(x.user);
  return { token, refreshToken, tokenExpires, user };
}

function flattenErrorMap(errors: Record<string, unknown>, prefix = ""): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(errors)) {
    const label = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      parts.push(`${label}: ${value}`);
    } else if (isRecord(value)) {
      parts.push(...flattenErrorMap(value, label));
    } else if (Array.isArray(value)) {
      parts.push(`${label}: ${value.map(String).join(", ")}`);
    }
  }
  return parts;
}

export function extractAuthError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data: unknown = error.response?.data;
    if (status === 401) return "Invalid email or password";
    if (isRecord(data)) {
      if (isRecord(data.errors)) {
        const messages = flattenErrorMap(data.errors);
        if (messages.length > 0) return messages.join(". ");
      }
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }
    }
    if (status === 422) return "Please check the form fields and try again";
    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Authentication failed";
}

export async function authMe(): Promise<AuthUser> {
  if (!COOKIE_MODE) {
    await ensureAccessToken();
  }
  const res = await api.get<unknown>(ME_PATH);
  const parsed = parseAuthUser(res.data);
  if (!parsed) throw new Error("Invalid profile");
  return parsed;
}

export async function authLogin(payload: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  const res = await api.post<unknown>(LOGIN_PATH, payload);
  const parsed = parseLoginResponse(res.data);
  if (!parsed?.token) throw new Error("Login failed: invalid response");
  setTokens(parsed.token, parsed.refreshToken, parsed.tokenExpires);

  const me = await authMe().catch(() => null);
  if (me) return me;

  if (COOKIE_MODE) {
    const me2 = await authMe().catch(() => null);
    if (me2) return me2;
  }

  if (parsed.user?.id) return parsed.user;
  throw new Error("Login failed: no profile");
}

export async function authRegister(payload: RegisterPayload): Promise<AuthUser> {
  await api.post(REGISTER_PATH, payload);
  return authLogin({ email: payload.email, password: payload.password });
}

export async function authLogout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    /* still clear local session */
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
