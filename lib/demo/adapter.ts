import {
  AxiosError,
  AxiosHeaders,
  CanceledError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { isRecord } from "./http";
import { handleDemoRequest } from "./router";

/**
 * Axios adapter for demo mode: answers from the in-browser mock backend instead of the network.
 * Responses go through axios' normal transformResponse/validateStatus, so callers can't tell the difference.
 */

const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  422: "Unprocessable Entity",
  500: "Internal Server Error",
};

/** Path relative to the API base (/vessels, /auth/me …) plus the query string params */
function parseUrl(config: InternalAxiosRequestConfig): { path: string; query: Record<string, string> } {
  const base = (config.baseURL ?? "").replace(/\/+$/, "");
  let url = config.url ?? "";
  if (base && url.startsWith(base)) url = url.slice(base.length);
  const parsed = new URL(url, "http://demo.local");
  let path = parsed.pathname.replace(/\/+$/, "") || "/";
  path = path.replace(/^\/api\/v1(?=\/)/, "");
  const query: Record<string, string> = {};
  parsed.searchParams.forEach((v, k) => {
    query[k] = v;
  });
  const params: unknown = config.params;
  if (params instanceof URLSearchParams) {
    params.forEach((v, k) => {
      query[k] = v;
    });
  } else if (isRecord(params)) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) query[k] = String(v);
    }
  }
  return { path, query };
}

function parseBody(data: unknown): { body: Record<string, unknown>; form: FormData | null } {
  if (typeof FormData !== "undefined" && data instanceof FormData) return { body: {}, form: data };
  if (typeof data === "string" && data) {
    try {
      const parsed: unknown = JSON.parse(data);
      return { body: isRecord(parsed) ? parsed : {}, form: null };
    } catch {
      return { body: {}, form: null };
    }
  }
  return { body: isRecord(data) ? data : {}, form: null };
}

function readToken(config: InternalAxiosRequestConfig): string | null {
  const headers = AxiosHeaders.from(config.headers);
  const value = headers.get("Authorization");
  return typeof value === "string" ? value : null;
}

/** Feels like a fast server, and lets loading states render for a beat */
function wait(method: string, signal: InternalAxiosRequestConfig["signal"]): Promise<void> {
  const ms = (method === "GET" ? 70 : 140) + Math.round(Math.random() * 120);
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new CanceledError());
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener?.("abort", () => {
      clearTimeout(timer);
      reject(new CanceledError());
    });
  });
}

export async function demoAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method ?? "get").toUpperCase();
  const { path, query } = parseUrl(config);
  const { body, form } = parseBody(config.data);
  await wait(method, config.signal);

  const result = handleDemoRequest({ method, path, query, body, form, token: readToken(config) });
  const wantsBlob = config.responseType === "blob";
  let data: unknown;
  if (result.blob) data = wantsBlob ? result.blob : await result.blob.text();
  else if (result.data === undefined) data = "";
  else if (wantsBlob) data = new Blob([JSON.stringify(result.data)], { type: "application/json" });
  else data = JSON.stringify(result.data);

  const response: AxiosResponse = {
    data,
    status: result.status,
    statusText: STATUS_TEXT[result.status] ?? "",
    headers: new AxiosHeaders(result.headers ?? (result.data === undefined ? {} : { "content-type": "application/json" })),
    config,
    request: { responseURL: `demo://${path}` },
  };
  const valid = config.validateStatus ? config.validateStatus(result.status) : result.status >= 200 && result.status < 300;
  if (valid) return response;
  throw new AxiosError(
    `Request failed with status code ${result.status}`,
    result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
    config,
    response.request,
    response,
  );
}
