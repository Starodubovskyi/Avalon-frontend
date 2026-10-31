"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Search, SquarePen, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/network/api";
import { useNow } from "@/lib/network/hooks";
import { conversationTitle, firstName, listTime, personName, sameUser } from "@/lib/network/format";
import { btn, EmptyState, ErrorBlock, LoadingBlock, TextInput } from "../ui/primitives";
import { CountPill, focusRing } from "../network/bits";
import { ConversationAvatar } from "./ConversationAvatar";
import type { NewChatMode } from "./NewConversationDialog";

function preview(c: Conversation, meId: number): string {
  const last = c.lastMessage;
  if (!last) return c.kind === "group" ? "Group created — no messages yet" : "No messages yet";
  if (sameUser(last.senderId, meId)) return `You: ${last.body}`;
  if (c.kind === "group") {
    const sender = c.members.find((m) => sameUser(m.id, last.senderId));
    return sender ? `${firstName(sender)}: ${last.body}` : last.body;
  }
  return last.body;
}

export function ConversationList({
  conversations,
  loading,
  error,
  onRetry,
  activeId,
  meId,
  onSelect,
  onNew,
}: {
  conversations: Conversation[];
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  activeId: string | null;
  meId: number;
  onSelect: (id: string) => void;
  onNew: (mode: NewChatMode) => void;
}) {
  const [query, setQuery] = useState("");
  const now = useNow();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const haystack = [conversationTitle(c, meId), ...c.members.map((m) => `${personName(m)} ${m.email ?? ""}`)];
      return haystack.some((s) => s.toLowerCase().includes(q));
    });
  }, [conversations, query, meId]);

  const unreadTotal = conversations.reduce((sum, c) => sum + (c.id === activeId ? 0 : c.unreadCount), 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 border-b px-4 pb-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold leading-tight">Chats</h2>
            <p className="text-xs text-muted-foreground">
              {unreadTotal ? `${unreadTotal} unread` : conversations.length ? "All caught up" : "Direct and group chats"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={() => onNew("group")} className={cn(btn.secondary, "h-9 w-9 px-0")} aria-label="New group" title="New group">
              <Users className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" onClick={() => onNew("direct")} className={cn(btn.primary, "h-9 px-3")}>
              <SquarePen className="h-4 w-4" aria-hidden /> New chat
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <TextInput
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="h-9 pl-9 text-base sm:text-sm"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {error && !conversations.length ? (
          <div className="p-2">
            <ErrorBlock error={error} onRetry={onRetry} />
          </div>
        ) : null}
        {loading && !conversations.length ? <LoadingBlock label="Loading chats…" /> : null}
        {!loading && !error && !conversations.length ? (
          <EmptyState
            icon={<MessageCircle className="h-7 w-7" />}
            title="No conversations yet"
            text="Message a colleague or start a group for a vessel call."
            action={
              <button type="button" onClick={() => onNew("direct")} className={btn.primary}>
                <SquarePen className="h-4 w-4" aria-hidden /> New chat
              </button>
            }
          />
        ) : null}
        {conversations.length > 0 && !filtered.length ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">No chats match “{query.trim()}”.</p>
        ) : null}

        <ul className="space-y-0.5">
          {filtered.map((c) => {
            const active = c.id === activeId;
            const unread = active ? 0 : c.unreadCount;
            const stamp = c.lastMessageAt ?? c.lastMessage?.createdAt ?? null;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition",
                    focusRing,
                    active ? "bg-primary/[0.08] shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]" : "hover:bg-accent/60",
                  )}
                >
                  <ConversationAvatar conversation={c} meId={meId} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={cn("truncate text-sm", unread ? "font-bold text-foreground" : "font-semibold")}>
                        {conversationTitle(c, meId)}
                      </span>
                      {stamp ? (
                        <time dateTime={stamp} className={cn("tabular shrink-0 text-[11px]", unread ? "font-semibold text-primary" : "text-muted-foreground")}>
                          {listTime(stamp, now)}
                        </time>
                      ) : null}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className={cn("truncate text-[13px]", unread ? "font-medium text-foreground" : "text-muted-foreground")}>
                        {preview(c, meId)}
                      </span>
                      <CountPill count={unread} label="unread" />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
