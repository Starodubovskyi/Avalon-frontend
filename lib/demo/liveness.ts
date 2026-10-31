import { isoAfter, uuid } from "./ids";
import type { ConversationRow, DemoState } from "./types";

/** Cheap "live" touches: simulated AIS drift and colleague replies picked up by chat polling */

const MAX_STEP_MS = 10 * 60_000;
const MAX_DRIFT_NM = 12;

function distanceNm(a: [number, number], b: [number, number]): number {
  const dLat = (b[0] - a[0]) * 60;
  const dLng = (b[1] - a[1]) * 60 * Math.cos((a[0] * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/** Moves AIS vessels that are under way along their course; keeps fixes of anchored ones fresh */
export function driftVessels(state: DemoState, now: number): boolean {
  let changed = false;
  for (const v of state.vessels) {
    if (v.deletedAt || v.departedAt || v.positionSource !== "ais" || v.lat === null || v.lng === null) continue;
    const last = v.positionAt ? new Date(v.positionAt).getTime() : now;
    const step = Math.min(Math.max(now - last, 0), MAX_STEP_MS);
    if (step < 5_000) continue;
    changed = true;
    const sog = v.sog ?? 0;
    if (sog >= 1 && v.cog !== null) {
      const nm = (sog * step) / 3_600_000;
      const rad = (v.cog * Math.PI) / 180;
      let lat = v.lat + (nm * Math.cos(rad)) / 60;
      let lng = v.lng + (nm * Math.sin(rad)) / (60 * Math.cos((v.lat * Math.PI) / 180));
      if (v.anchor && distanceNm(v.anchor, [lat, lng]) > MAX_DRIFT_NM) [lat, lng] = v.anchor;
      v.lat = Math.round(lat * 1e5) / 1e5;
      v.lng = Math.round(lng * 1e5) / 1e5;
      v.cog = Math.round((v.cog + (Math.random() - 0.5) * 3 + 360) % 360);
      v.sog = Math.round(Math.min(14, Math.max(1, sog + (Math.random() - 0.5) * 0.3)) * 10) / 10;
    }
    v.positionAt = new Date(now - Math.round(Math.random() * 90_000)).toISOString();
  }
  return changed;
}

const ACKS = [
  "Got it, thanks — I'll update the board.",
  "Noted. I'll call the master and confirm.",
  "OK, checking with the harbour master and coming back to you.",
  "Perfect, I'll let the pilot station know.",
  "Thanks! I'll send the documents within the hour.",
];
const ANSWERS = [
  "Good question — give me 10 minutes, I'm checking with the terminal.",
  "Yes, that's confirmed on our side.",
  "Not yet — owners still haven't replied. I'll chase them.",
  "Let me look at the line-up and get back to you shortly.",
];

function pick<T>(list: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return list[Math.abs(h) % list.length];
}

/** One simulated answer per conversation at a time, 3–6 s after my message */
export function scheduleReply(state: DemoState, conv: ConversationRow, senderId: number, body: string): void {
  if (state.pendingReplies.some((p) => p.conversationId === conv.id)) return;
  const others = conv.members
    .map((m) => m.userId)
    .filter((id) => id !== senderId && state.users.some((u) => u.id === id && !u.deletedAt));
  if (others.length === 0) return;
  const responder = pick(others, body + conv.id);
  const text = pick(body.includes("?") ? ANSWERS : ACKS, body);
  const dueAt = new Date(Date.now() + 3_000 + Math.round(Math.random() * 3_000)).toISOString();
  state.pendingReplies.push({ conversationId: conv.id, senderId: responder, body: text, dueAt });
}

/** Materialises replies whose time has come; returns true when the state changed */
export function flushDueReplies(state: DemoState, now: number): boolean {
  if (state.pendingReplies.length === 0) return false;
  const due = state.pendingReplies.filter((p) => new Date(p.dueAt).getTime() <= now);
  if (due.length === 0) return false;
  state.pendingReplies = state.pendingReplies.filter((p) => !due.includes(p));
  for (const p of due) {
    const conv = state.conversations.find((c) => c.id === p.conversationId);
    if (!conv) continue;
    const createdAt = isoAfter(conv.lastMessageAt);
    state.messages.push({ id: uuid(), conversationId: conv.id, senderId: p.senderId, body: p.body, createdAt });
    conv.lastMessageAt = createdAt;
    const member = conv.members.find((m) => m.userId === p.senderId);
    if (member) member.lastReadAt = createdAt;
  }
  return true;
}
