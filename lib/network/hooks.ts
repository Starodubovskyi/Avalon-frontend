"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR, { unstable_serialize, useSWRConfig } from "swr";
import useSWRInfinite, { type SWRInfiniteKeyedMutator } from "swr/infinite";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/useAuth";
import {
  isNotFound,
  NetworkApi,
  networkError,
  type ChatMessage,
  type Conversation,
  type CreateConversationInput,
  type FeedScope,
  type PeopleFilter,
  type Person,
  type Post,
  type PostComment,
  type UserCard,
} from "./api";

/** Polling cadence from the design doc — Vercel backend, so no WebSocket */
export const POLL = {
  dialog: 3_000,
  conversations: 10_000,
  feed: 30_000,
  unread: 15_000,
} as const;

const MESSAGE_PAGE = 50;
const FEED_PAGE = 20;

const CONVERSATIONS_KEY = "chat-conversations";
const UNREAD_KEY = "chat-unread";

type MessagesKey = readonly ["chat-messages", string];
type FeedKey = readonly ["posts", FeedScope, string | null];
type CommentsKey = readonly ["post-comments", string];
type PeopleKey = readonly ["people", PeopleFilter, string];
type DirectoryKey = readonly ["directory", string];

export type ChatMessageView = ChatMessage & { pending?: boolean };

/* ---------- small shared hooks ---------- */

export function useDebounced<T>(value: T, ms = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** Re-render clock for relative timestamps */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => typeof document === "undefined" || document.visibilityState === "visible");
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return visible;
}

/* ---------- chat ---------- */

export function useChatUnread() {
  const { isAuthed } = useAuth();
  return useSWR<{ total: number }>(isAuthed ? UNREAD_KEY : null, () => NetworkApi.unread(), {
    refreshInterval: POLL.unread,
    shouldRetryOnError: false,
  });
}

export function useConversations() {
  const { isAuthed } = useAuth();
  return useSWR<Conversation[]>(isAuthed ? CONVERSATIONS_KEY : null, () => NetworkApi.conversations(), {
    refreshInterval: POLL.conversations,
    keepPreviousData: true,
  });
}

export function useDirectory(search: string, enabled: boolean) {
  const { isAuthed } = useAuth();
  const key: DirectoryKey | null = isAuthed && enabled ? ["directory", search.trim()] : null;
  return useSWR<UserCard[]>(key, ([, q]: DirectoryKey) => NetworkApi.directory(q), { keepPreviousData: true });
}

/** Confirmed messages by time, optimistic ones (not yet saved) last */
function ordered(list: ChatMessageView[]): ChatMessageView[] {
  const confirmed = list.filter((m) => !m.pending).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return [...confirmed, ...list.filter((m) => m.pending)];
}

function lastConfirmed(list: ChatMessageView[] | undefined): ChatMessageView | undefined {
  if (!list) return undefined;
  for (let i = list.length - 1; i >= 0; i -= 1) if (!list[i].pending) return list[i];
  return undefined;
}

function mergeMessages(current: ChatMessageView[] | undefined, fresh: ChatMessage[]): ChatMessageView[] {
  if (!current?.length) return fresh;
  const known = new Set(current.filter((m) => !m.pending).map((m) => m.id));
  const incoming = fresh.filter((m) => !known.has(m.id));
  if (!incoming.length) return current;
  // My own message can arrive through the poll before its POST resolves — drop the optimistic twin
  const kept = current.filter(
    (m) => !m.pending || !incoming.some((n) => n.sender.id === m.sender.id && n.body === m.body),
  );
  return ordered([...kept, ...incoming]);
}

/** Open dialog: last page first, then only `after` the newest message every 3 s */
export function useMessages(conversationId: string | null) {
  const { isAuthed } = useAuth();
  const { cache } = useSWRConfig();
  const key: MessagesKey | null = isAuthed && conversationId ? ["chat-messages", conversationId] : null;

  return useSWR<ChatMessageView[]>(
    key,
    async ([, id]: MessagesKey) => {
      const cacheKey = unstable_serialize(["chat-messages", id]);
      const read = () => cache.get(cacheKey)?.data as ChatMessageView[] | undefined;
      const anchor = lastConfirmed(read());
      if (!anchor) return NetworkApi.messages(id, { limit: MESSAGE_PAGE });
      const fresh = await NetworkApi.messages(id, { after: anchor.createdAt, limit: MESSAGE_PAGE });
      // merge into what is cached now: an optimistic message may have been added meanwhile
      return mergeMessages(read(), fresh);
    },
    { refreshInterval: POLL.dialog, dedupingInterval: 1_000 },
  );
}

function bumpConversation(list: Conversation[] | undefined, msg: ChatMessage): Conversation[] | undefined {
  if (!list) return list;
  const idx = list.findIndex((c) => c.id === msg.conversationId);
  if (idx === -1) return list;
  const updated: Conversation = {
    ...list[idx],
    lastMessage: { body: msg.body, senderId: msg.sender.id, createdAt: msg.createdAt },
    lastMessageAt: msg.createdAt,
  };
  return [updated, ...list.slice(0, idx), ...list.slice(idx + 1)];
}

let pendingSeq = 0;

export function useChatActions() {
  const { mutate } = useSWRConfig();

  const createConversation = useCallback(
    async (input: CreateConversationInput) => {
      try {
        const conv = await NetworkApi.createConversation(input);
        await mutate(
          CONVERSATIONS_KEY,
          (list?: Conversation[]) => {
            const rest = list ?? [];
            // a repeated direct chat comes back as the existing conversation — keep its place
            return rest.some((c) => c.id === conv.id) ? rest.map((c) => (c.id === conv.id ? conv : c)) : [conv, ...rest];
          },
          { revalidate: false },
        );
        return conv;
      } catch (e) {
        toast.error(networkError(e));
        throw e;
      }
    },
    [mutate],
  );

  /** Optimistic send; resolves false (and rolls back) when the server rejects it */
  const sendMessage = useCallback(
    async (conversationId: string, body: string, me: UserCard): Promise<boolean> => {
      const key: MessagesKey = ["chat-messages", conversationId];
      pendingSeq += 1;
      const temp: ChatMessageView = {
        id: `pending-${Date.now()}-${pendingSeq}`,
        conversationId,
        sender: me,
        body,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      await mutate(key, (list?: ChatMessageView[]) => [...(list ?? []), temp], { revalidate: false });
      try {
        const saved = await NetworkApi.sendMessage(conversationId, body);
        await mutate(
          key,
          (list?: ChatMessageView[]) => ordered([...(list ?? []).filter((m) => m.id !== temp.id && m.id !== saved.id), saved]),
          { revalidate: false },
        );
        await mutate(CONVERSATIONS_KEY, (list?: Conversation[]) => bumpConversation(list, saved), { revalidate: false });
        return true;
      } catch (e) {
        await mutate(key, (list?: ChatMessageView[]) => list?.filter((m) => m.id !== temp.id), { revalidate: false });
        toast.error(networkError(e));
        return false;
      }
    },
    [mutate],
  );

  const markRead = useCallback(
    async (conversationId: string) => {
      let cleared = 0;
      await mutate(
        CONVERSATIONS_KEY,
        (list?: Conversation[]) =>
          list?.map((c) => {
            if (c.id !== conversationId || !c.unreadCount) return c;
            cleared = c.unreadCount;
            return { ...c, unreadCount: 0 };
          }),
        { revalidate: false },
      );
      if (cleared) {
        await mutate(UNREAD_KEY, (u?: { total: number }) => (u ? { total: Math.max(0, u.total - cleared) } : u), {
          revalidate: false,
        });
      }
      try {
        await NetworkApi.markRead(conversationId);
      } catch {
        // read receipts are best-effort: restore the server's counts instead of nagging with a toast
        void mutate(CONVERSATIONS_KEY);
      }
      void mutate(UNREAD_KEY);
    },
    [mutate],
  );

  return { createConversation, sendMessage, markRead };
}

/* ---------- feed ---------- */

export function useFeed(scope: FeedScope) {
  const { isAuthed } = useAuth();
  const swr = useSWRInfinite<Post[]>(
    (index: number, prev: Post[] | null): FeedKey | null => {
      if (!isAuthed) return null;
      if (index === 0) return ["posts", scope, null];
      if (!prev || prev.length < FEED_PAGE) return null;
      return ["posts", scope, prev[prev.length - 1].createdAt];
    },
    ([, s, before]: FeedKey) => NetworkApi.posts({ scope: s, before: before ?? undefined, limit: FEED_PAGE }),
    { refreshInterval: POLL.feed },
  );

  const posts = useMemo(() => {
    const seen = new Set<string>();
    return (swr.data ?? []).flat().filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  }, [swr.data]);
  const lastPage = swr.data?.[swr.data.length - 1];
  const hasMore = !!lastPage && lastPage.length === FEED_PAGE;
  const loadingMore = swr.size > (swr.data?.length ?? 0) && !!swr.data;

  return { ...swr, posts, hasMore, loadingMore };
}

type FeedMutate = SWRInfiniteKeyedMutator<Post[][]>;

function patchPost(mutate: FeedMutate, id: string, patch: (p: Post) => Post) {
  return mutate((pages) => pages?.map((page) => page.map((p) => (p.id === id ? patch(p) : p))), { revalidate: false });
}

export function useFeedActions(mutate: FeedMutate) {
  const createPost = useCallback(
    async (body: string): Promise<boolean> => {
      try {
        const post = await NetworkApi.createPost(body);
        await mutate((pages) => (pages?.length ? [[post, ...pages[0]], ...pages.slice(1)] : [[post]]), { revalidate: false });
        return true;
      } catch (e) {
        toast.error(networkError(e));
        return false;
      }
    },
    [mutate],
  );

  const toggleLike = useCallback(
    async (post: Post) => {
      const liked = !post.likedByMe;
      const before = { likedByMe: post.likedByMe, likeCount: post.likeCount };
      await patchPost(mutate, post.id, (p) => ({ ...p, likedByMe: liked, likeCount: Math.max(0, p.likeCount + (liked ? 1 : -1)) }));
      try {
        const res = liked ? await NetworkApi.like(post.id) : await NetworkApi.unlike(post.id);
        await patchPost(mutate, post.id, (p) => ({ ...p, likedByMe: res.likedByMe, likeCount: res.likeCount }));
      } catch (e) {
        await patchPost(mutate, post.id, (p) => ({ ...p, ...before }));
        toast.error(networkError(e));
      }
    },
    [mutate],
  );

  const removePost = useCallback(
    async (post: Post): Promise<boolean> => {
      try {
        await NetworkApi.deletePost(post.id);
        toast.success("Post deleted");
      } catch (e) {
        if (!isNotFound(e)) {
          toast.error(networkError(e));
          return false;
        }
        toast.info("That post had already been deleted");
      }
      await mutate((pages) => pages?.map((page) => page.filter((p) => p.id !== post.id)), { revalidate: false });
      return true;
    },
    [mutate],
  );

  const adjustComments = useCallback(
    (postId: string, delta: number) =>
      patchPost(mutate, postId, (p) => ({ ...p, commentCount: Math.max(0, p.commentCount + delta) })),
    [mutate],
  );

  return useMemo(
    () => ({ createPost, toggleLike, removePost, adjustComments }),
    [createPost, toggleLike, removePost, adjustComments],
  );
}

export type FeedActions = ReturnType<typeof useFeedActions>;

export function useComments(postId: string, enabled: boolean) {
  const { isAuthed } = useAuth();
  const key: CommentsKey | null = isAuthed && enabled ? ["post-comments", postId] : null;
  return useSWR<PostComment[]>(key, ([, id]: CommentsKey) => NetworkApi.comments(id), { refreshInterval: POLL.feed });
}

export function useCommentActions(postId: string, onCountChange: (delta: number) => void) {
  const { mutate } = useSWRConfig();
  const key: CommentsKey = useMemo(() => ["post-comments", postId], [postId]);

  const addComment = useCallback(
    async (body: string): Promise<boolean> => {
      try {
        const saved = await NetworkApi.addComment(postId, body);
        await mutate(key, (list?: PostComment[]) => [...(list ?? []).filter((c) => c.id !== saved.id), saved], { revalidate: false });
        onCountChange(1);
        return true;
      } catch (e) {
        toast.error(networkError(e));
        return false;
      }
    },
    [key, mutate, onCountChange, postId],
  );

  const removeComment = useCallback(
    async (comment: PostComment) => {
      try {
        await NetworkApi.deleteComment(comment.id);
      } catch (e) {
        if (!isNotFound(e)) {
          toast.error(networkError(e));
          return;
        }
        toast.info("That comment had already been deleted");
      }
      await mutate(key, (list?: PostComment[]) => list?.filter((c) => c.id !== comment.id), { revalidate: false });
      onCountChange(-1);
    },
    [key, mutate, onCountChange],
  );

  return { addComment, removeComment };
}

/* ---------- people ---------- */

function isPeopleKey(key: unknown): key is PeopleKey {
  return Array.isArray(key) && key[0] === "people";
}

export function usePeople(search: string, filter: PeopleFilter) {
  const { isAuthed } = useAuth();
  const key: PeopleKey | null = isAuthed ? ["people", filter, search.trim()] : null;
  return useSWR<Person[]>(key, ([, f, q]: PeopleKey) => NetworkApi.people({ filter: f, search: q }), {
    keepPreviousData: true,
  });
}

export function usePeopleActions() {
  const { mutate } = useSWRConfig();

  const patchPerson = useCallback(
    (id: number, patch: (p: Person) => Person) =>
      mutate(isPeopleKey, (list?: Person[]) => list?.map((p) => (p.id === id ? patch(p) : p)), { revalidate: false }),
    [mutate],
  );

  /** Optimistic follow/unfollow; filtered lists (friends, following) refresh after the server answers */
  const toggleFollow = useCallback(
    async (person: Person) => {
      const follow = !person.followedByMe;
      const before = { followedByMe: person.followedByMe, followers: person.followers };
      await patchPerson(person.id, (p) => ({ ...p, followedByMe: follow, followers: Math.max(0, p.followers + (follow ? 1 : -1)) }));
      try {
        const saved = follow ? await NetworkApi.follow(person.id) : await NetworkApi.unfollow(person.id);
        await patchPerson(person.id, () => saved);
        void mutate(isPeopleKey);
      } catch (e) {
        await patchPerson(person.id, (p) => ({ ...p, ...before }));
        toast.error(networkError(e));
      }
    },
    [mutate, patchPerson],
  );

  return { toggleFollow };
}
