"use client";

import { useCallback, useEffect, useMemo } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation, UserCard } from "@/lib/network/api";
import { useChatActions, useMessages, usePageVisible } from "@/lib/network/hooks";
import { conversationTitle, firstName, otherMembers, roleIdOf, sameUser } from "@/lib/network/format";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { btn, EmptyState } from "../ui/primitives";
import { PersonRoleBadge } from "../network/bits";
import { ConversationAvatar } from "./ConversationAvatar";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";

export function ConversationPane({
  conversation,
  me,
  onBack,
}: {
  conversation: Conversation;
  me: UserCard;
  onBack: () => void;
}) {
  const { data, error, isLoading, mutate } = useMessages(conversation.id);
  const { sendMessage, markRead } = useChatActions();
  const visible = usePageVisible();
  const messages = useMemo(() => data ?? [], [data]);
  const isGroup = conversation.kind === "group";
  const title = conversationTitle(conversation, me.id);
  const others = otherMembers(conversation, me.id);
  const peer = isGroup ? null : others[0];

  const lastIncomingId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      if (!m.pending && !sameUser(m.sender.id, me.id)) return m.id;
    }
    return null;
  }, [messages, me.id]);

  // Opening the dialog reads it; so does every new incoming message while the tab is in front
  const loaded = data !== undefined;
  useEffect(() => {
    if (loaded && visible) void markRead(conversation.id);
  }, [conversation.id, lastIncomingId, loaded, visible, markRead]);

  const send = useCallback((body: string) => sendMessage(conversation.id, body, me), [conversation.id, me, sendMessage]);

  const subtitle = isGroup
    ? `${conversation.members.length} members · ${others.map(firstName).join(", ")}${others.length ? ", you" : ""}`
    : peer?.email ?? ROLE_LABEL[roleIdOf(peer?.role)] ?? "";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b px-3 py-3 sm:px-5">
        <button type="button" onClick={onBack} className={cn(btn.icon, "-ml-1 md:hidden")} aria-label="Back to conversations">
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
        <ConversationAvatar conversation={conversation} meId={me.id} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate font-display text-[15px] font-bold">{title}</h2>
            {peer ? <PersonRoleBadge role={peer.role} compact className="hidden sm:inline-flex" /> : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </header>

      <MessageList
        messages={messages}
        meId={me.id}
        isGroup={isGroup}
        loading={isLoading}
        error={error}
        onRetry={() => void mutate()}
        empty={
          <EmptyState
            icon={<MessageCircle className="h-7 w-7" />}
            title="No messages yet"
            text={isGroup ? "Say hello to the group — everyone here will see it." : `Start the conversation with ${firstName(peer)}.`}
          />
        }
      />

      <MessageComposer onSend={send} placeholder={isGroup ? `Message ${title}` : `Message ${firstName(peer)}`} />
    </div>
  );
}
