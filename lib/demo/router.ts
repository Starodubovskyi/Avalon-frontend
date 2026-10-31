import { getState, markDirty, persistIfDirty } from "./db";
import { DemoHttpError, badRequest, type DemoHandler, type DemoRequest, type DemoResult, type RouteDef } from "./http";
import { flushDueReplies } from "./liveness";
import { demoUserIdFromToken } from "./mode";
import { chatRoutes } from "./handlers/chat";
import { documentRoutes } from "./handlers/documents";
import { eventRoutes } from "./handlers/events";
import { peopleRoutes } from "./handlers/people";
import { pointRoutes } from "./handlers/points";
import { portRoutes } from "./handlers/ports";
import { requestRoutes } from "./handlers/requests";
import { socialRoutes } from "./handlers/social";
import { userRoutes } from "./handlers/users";
import { vesselRoutes } from "./handlers/vessels";

/** Method + path pattern → handler. More specific patterns are listed first where they overlap. */

interface CompiledRoute {
  method: string;
  regex: RegExp;
  keys: string[];
  handler: DemoHandler;
}

function compile([method, pattern, handler]: RouteDef): CompiledRoute {
  const keys: string[] = [];
  const source = pattern
    .split("/")
    .map((part) => {
      if (!part.startsWith(":")) return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      keys.push(part.slice(1));
      return "([^/]+)";
    })
    .join("/");
  return { method, regex: new RegExp(`^${source}/?$`), keys, handler };
}

const ROUTES: CompiledRoute[] = [
  ...peopleRoutes, // /users/directory before /users/:id
  ...userRoutes,
  ...vesselRoutes,
  ...eventRoutes,
  ...documentRoutes,
  ...pointRoutes,
  ...chatRoutes,
  ...socialRoutes,
  ...portRoutes,
  ...requestRoutes,
].map(compile);

export interface RawDemoRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  body: Record<string, unknown>;
  form: FormData | null;
  token: string | null;
}

export function handleDemoRequest(raw: RawDemoRequest): DemoResult {
  const state = getState();
  if (flushDueReplies(state, Date.now())) markDirty();

  const userId = demoUserIdFromToken(raw.token);
  const user = userId === null ? null : state.users.find((u) => u.id === userId && !u.deletedAt) ?? null;

  const route = ROUTES.find((r) => r.method === raw.method && r.regex.test(raw.path));
  if (!route) {
    return {
      status: 404,
      data: { message: `Cannot ${raw.method} /api/v1${raw.path}`, error: "Not Found", statusCode: 404 },
    };
  }

  let result: DemoResult;
  try {
    const m = route.regex.exec(raw.path) ?? [];
    const params: Record<string, string> = {};
    route.keys.forEach((k, i) => {
      try {
        params[k] = decodeURIComponent(m[i + 1] ?? "");
      } catch {
        badRequest(`Failed to decode param '${m[i + 1]}'`);
      }
    });
    const req: DemoRequest = { ...raw, params, user, state };
    result = route.handler(req);
  } catch (e) {
    result = e instanceof DemoHttpError ? e.result : { status: 500, data: { statusCode: 500, message: "Internal server error" } };
  }
  if (raw.method !== "GET" && result.status < 400) markDirty();
  persistIfDirty();
  return result;
}
