"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessagesSquare, SearchX, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { useChatActions, useConversations } from "@/lib/network/hooks";
import { toUserCard } from "@/lib/network/format";
import { btn, EmptyState, LoadingBlock } from "../ui/primitives";
import { ConversationList } from "./ConversationList";
import { ConversationPane } from "./ConversationPane";
import { NewConversationDialog, type NewChatMode } from "./NewConversationDialog";

/**
 * /chat — list + dialog. The open dialog lives in ?c=<id> (shareable, survives reload);
 * ?with=<userId> (People → Message) opens or creates the direct chat and is then replaced by ?c=.
 */
export function ChatView() {
  const router = useRouter();
  const params = useSearchParams();
  const activeId = params?.get("c") ?? null;
  const withParam = params?.get("with") ?? null;
  const { user } = useAuth();
  const me = useMemo(() => (user ? toUserCard(user) : null), [user]);
  const { data, error, isLoading, mutate } = useConversations();
  const { createConversation } = useChatActions();
  const [dialog, setDialog] = useState<NewChatMode | null>(null);
  const [opening, setOpening] = useState(false);
  const handledWith = useRef<string | null>(null);

  const select = useCallback(
    (id: string | null) => router.replace(id ? `/chat?c=${encodeURIComponent(id)}` : "/chat", { scroll: false }),
    [router],
  );

  useEffect(() => {
    if (!withParam || handledWith.current === withParam) return;
    handledWith.current = withParam;
    const userId = Number(withParam);
    if (!Number.isInteger(userId) || userId <= 0) {
      select(null);
      return;
    }
    setOpening(true);
    createConversation({ userIds: [userId] })
      .then(
        (conv) => select(conv.id),
        () => select(null),
      )
      .finally(() => setOpening(false));
  }, [withParam, createConversation, select]);

  const conversations = data ?? [];
  const active = activeId ? conversations.find((c) => c.id === activeId) ?? null : null;
  const showPane = Boolean(activeId) || opening || Boolean(withParam);

  const newChatButton = (
    <button type="button" onClick={() => setDialog("direct")} className={btn.primary}>
      <SquarePen className="h-4 w-4" aria-hidden /> New chat
    </button>
  );

  let pane: ReactNode;
  if (active && me) {
    pane = <ConversationPane key={active.id} conversation={active} me={me} onBack={() => select(null)} />;
  } else if (opening || withParam || (activeId && isLoading && !data)) {
    pane = <LoadingBlock label="Opening conversation…" />;
  } else if (activeId) {
    pane = (
      <EmptyState
        icon={<SearchX className="h-7 w-7" />}
        title="Conversation not found"
        text="It may have been removed, or you are not a member of it."
        action={
          <button type="button" onClick={() => select(null)} className={btn.secondary}>
            Back to chats
          </button>
        }
      />
    );
  } else {
    pane = (
      <EmptyState
        icon={<MessagesSquare className="h-7 w-7" />}
        title="Pick a conversation"
        text="Choose a chat on the left, or start a new one with a colleague."
        action={newChatButton}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 sm:p-4 lg:p-6">
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden bg-card sm:rounded-2xl sm:border sm:shadow-card">
        <aside
          aria-label="Conversations"
          className={cn("min-h-0 w-full flex-col md:flex md:w-80 md:shrink-0 md:border-r lg:w-72 xl:w-[340px]", showPane ? "hidden" : "flex")}
        >
          <ConversationList
            conversations={conversations}
            loading={isLoading}
            error={error}
            onRetry={() => void mutate()}
            activeId={activeId}
            meId={me?.id ?? 0}
            onSelect={select}
            onNew={setDialog}
          />
        </aside>
        <section
          aria-label="Conversation"
          className={cn("min-h-0 min-w-0 flex-1 flex-col bg-gradient-to-b from-background/40 to-card", showPane ? "flex" : "hidden md:flex")}
        >
          {active && me ? pane : <div className="flex flex-1 items-center justify-center">{pane}</div>}
        </section>
      </div>

      <NewConversationDialog
        mode={dialog}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        onCreated={(conv) => {
          setDialog(null);
          select(conv.id);
        }}
      />
    </div>
  );
}
