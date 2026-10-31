import type { ChatMessage, Conversation } from "@/lib/network/api";
import { isoAfter, uuid } from "../ids";
import {
  TEAM_ROLES,
  bodyText,
  created,
  intQuery,
  invalid,
  isoQuery,
  noContent,
  notFound,
  ok,
  requireUser,
  uuidParam,
  type DemoRequest,
  type RouteDef,
} from "../http";
import { scheduleReply } from "../liveness";
import { canSeeUser, cardById, findUser } from "../presenters";
import type { ConversationRow, DemoState, DemoUserRow, MessageRow } from "../types";

/** /conversations, /chat/unread — direct + group chat with per-member read markers */

const MESSAGE_MAX = 4000;
const TITLE_MAX = 80;

function unreadFor(state: DemoState, c: ConversationRow, userId: number): number {
  const me = c.members.find((m) => m.userId === userId);
  return state.messages.filter(
    (m) => m.conversationId === c.id && m.senderId !== userId && (!me?.lastReadAt || m.createdAt > me.lastReadAt),
  ).length;
}

function lastMessage(state: DemoState, conversationId: string): MessageRow | undefined {
  let last: MessageRow | undefined;
  for (const m of state.messages) {
    if (m.conversationId !== conversationId) continue;
    if (!last || m.createdAt > last.createdAt || (m.createdAt === last.createdAt && m.id > last.id)) last = m;
  }
  return last;
}

function toView(state: DemoState, c: ConversationRow, userId: number): Conversation {
  const last = lastMessage(state, c.id);
  const members = [...c.members].sort((a, b) => a.joinedAt.localeCompare(b.joinedAt) || a.userId - b.userId);
  return {
    id: c.id,
    kind: c.kind,
    title: c.title,
    members: members.map((m) => cardById(state, m.userId)),
    lastMessage: last ? { body: last.body, senderId: last.senderId, createdAt: last.createdAt } : null,
    unreadCount: unreadFor(state, c, userId),
    lastMessageAt: c.lastMessageAt,
  };
}

function toMessage(state: DemoState, m: MessageRow): ChatMessage {
  return { id: m.id, conversationId: m.conversationId, sender: cardById(state, m.senderId), body: m.body, createdAt: m.createdAt };
}

function mine(state: DemoState, userId: number): ConversationRow[] {
  return state.conversations
    .filter((c) => c.members.some((m) => m.userId === userId))
    .sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt) || b.id.localeCompare(a.id));
}

function memberConversation(req: DemoRequest, user: DemoUserRow): ConversationRow {
  const id = uuidParam(req);
  const conv = req.state.conversations.find((c) => c.id === id);
  if (!conv || !conv.members.some((m) => m.userId === user.id)) notFound("Conversation not found");
  return conv;
}

function list(req: DemoRequest) {
  const user = requireUser(req);
  return ok(mine(req.state, user.id).slice(0, 200).map((c) => toView(req.state, c, user.id)));
}

function create(req: DemoRequest) {
  const user = requireUser(req);
  const raw: unknown = req.body.userIds;
  const list: unknown[] = Array.isArray(raw) ? raw : [];
  if (list.length === 0) invalid({ userIds: "empty" });
  if (list.length > 50) invalid({ userIds: "tooMany" });
  const ids = list.filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id >= 1);
  if (ids.length !== list.length) invalid({ userIds: "each value in userIds must be an integer number" });
  const titleRaw = typeof req.body.title === "string" ? req.body.title.trim() : "";
  if (titleRaw.length > TITLE_MAX) invalid({ title: "tooLong" });

  const others = Array.from(new Set(ids)).filter((id) => id !== user.id);
  if (others.length === 0) invalid({ userIds: "notAllowed" });
  const team = TEAM_ROLES.includes(user.roleId);
  for (const id of others) {
    const target = findUser(req.state, id);
    if (!target || target.deletedAt) invalid({ userIds: team ? "notFound" : "notAllowed" });
    if (!canSeeUser(user, target)) invalid({ userIds: "notAllowed" });
  }

  const at = new Date().toISOString();
  let conv: ConversationRow | undefined;
  if (others.length === 1) {
    const key = `${Math.min(user.id, others[0])}:${Math.max(user.id, others[0])}`;
    conv = req.state.conversations.find((c) => c.directKey === key);
    if (!conv) {
      conv = { id: uuid(), kind: "direct", title: null, createdById: user.id, directKey: key, createdAt: at, lastMessageAt: null, members: [] };
      conv.members = [user.id, others[0]].map((userId, i) => ({ userId, joinedAt: new Date(Date.parse(at) + i).toISOString(), lastReadAt: null }));
      req.state.conversations.push(conv);
    }
  } else {
    if (!titleRaw) invalid({ title: "required" });
    conv = { id: uuid(), kind: "group", title: titleRaw, createdById: user.id, directKey: null, createdAt: at, lastMessageAt: null, members: [] };
    conv.members = [user.id, ...others].map((userId, i) => ({ userId, joinedAt: new Date(Date.parse(at) + i).toISOString(), lastReadAt: null }));
    req.state.conversations.push(conv);
  }
  return created(toView(req.state, conv, user.id));
}

function messages(req: DemoRequest) {
  const user = requireUser(req);
  const after = isoQuery(req, "after");
  const limit = intQuery(req, "limit", 1, 100) ?? 50;
  const conv = memberConversation(req, user);
  const rows = req.state.messages
    .filter((m) => m.conversationId === conv.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  if (after) {
    const cursor = new Date(after).toISOString();
    return ok(rows.filter((m) => m.createdAt > cursor).slice(0, limit).map((m) => toMessage(req.state, m)));
  }
  return ok(rows.slice(-limit).map((m) => toMessage(req.state, m)));
}

function send(req: DemoRequest) {
  const user = requireUser(req);
  const conv = memberConversation(req, user);
  const body = bodyText(req, "body", MESSAGE_MAX);
  const createdAt = isoAfter(conv.lastMessageAt);
  const row: MessageRow = { id: uuid(), conversationId: conv.id, senderId: user.id, body, createdAt };
  req.state.messages.push(row);
  conv.lastMessageAt = createdAt;
  const me = conv.members.find((m) => m.userId === user.id);
  if (me) me.lastReadAt = createdAt;
  scheduleReply(req.state, conv, user.id, body);
  return created(toMessage(req.state, row));
}

function markRead(req: DemoRequest) {
  const user = requireUser(req);
  const conv = memberConversation(req, user);
  const me = conv.members.find((m) => m.userId === user.id);
  if (me) {
    const now = new Date().toISOString();
    const newest = conv.lastMessageAt && conv.lastMessageAt > now ? conv.lastMessageAt : now;
    me.lastReadAt = me.lastReadAt && me.lastReadAt > newest ? me.lastReadAt : newest;
  }
  return noContent();
}

function unread(req: DemoRequest) {
  const user = requireUser(req);
  const total = mine(req.state, user.id).reduce((sum, c) => sum + unreadFor(req.state, c, user.id), 0);
  return ok({ total });
}

export const chatRoutes: RouteDef[] = [
  ["GET", "/conversations", list],
  ["POST", "/conversations", create],
  ["GET", "/conversations/:id/messages", messages],
  ["POST", "/conversations/:id/messages", send],
  ["POST", "/conversations/:id/read", markRead],
  ["GET", "/chat/unread", unread],
];
