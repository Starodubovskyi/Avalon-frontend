"use client";

import axios from "axios";
import api from "@/lib/api/client";

/** Network API (chat, feed, people) — contract: docs/designs/2026-10-31-community-chat-feed-people.md */

export type NetworkRole = "admin" | "staff" | "viewer";

export interface UserCard {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: NetworkRole;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: UserCard;
  body: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  kind: "direct" | "group";
  /** group title; null for direct chats (UI shows the other member) */
  title: string | null;
  /** every member, including me */
  members: UserCard[];
  lastMessage: { body: string; senderId: number; createdAt: string } | null;
  unreadCount: number;
  lastMessageAt: string | null;
}

export interface CreateConversationInput {
  userIds: number[];
  title?: string;
}

export interface Post {
  id: string;
  author: UserCard;
  body: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  canDelete: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  author: UserCard;
  body: string;
  createdAt: string;
  canDelete: boolean;
}

export interface LikeState {
  likeCount: number;
  likedByMe: boolean;
}

export interface Person extends UserCard {
  followedByMe: boolean;
  followsMe: boolean;
  followers: number;
  following: number;
  posts: number;
}

export type FeedScope = "all" | "following";
export type PeopleFilter = "all" | "friends" | "following" | "followers";

/** Body limits from the contract (server trims and rejects empty bodies with 422) */
export const LIMITS = {
  message: 4000,
  post: 5000,
  comment: 2000,
  groupTitle: 80,
} as const;

/** Drops empty query values so the URL stays clean */
function query<T extends Record<string, string | number | undefined>>(params: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(params) as [keyof T, T[keyof T]][]) {
    if (v !== undefined && v !== "") out[k] = v;
  }
  return out;
}

export const NetworkApi = {
  async directory(search = ""): Promise<UserCard[]> {
    const { data } = await api.get<UserCard[]>("/users/directory", { params: query({ search: search.trim() }) });
    return data;
  },

  async conversations(): Promise<Conversation[]> {
    const { data } = await api.get<Conversation[]>("/conversations");
    return data;
  },
  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const { data } = await api.post<Conversation>("/conversations", input);
    return data;
  },
  async messages(conversationId: string, params: { after?: string; limit?: number } = {}): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
      params: query(params),
    });
    return data;
  },
  async sendMessage(conversationId: string, body: string): Promise<ChatMessage> {
    const { data } = await api.post<ChatMessage>(`/conversations/${encodeURIComponent(conversationId)}/messages`, { body });
    return data;
  },
  async markRead(conversationId: string): Promise<void> {
    await api.post(`/conversations/${encodeURIComponent(conversationId)}/read`);
  },
  async unread(): Promise<{ total: number }> {
    const { data } = await api.get<{ total: number }>("/chat/unread");
    return data;
  },

  async posts(params: { scope: FeedScope; before?: string; limit?: number }): Promise<Post[]> {
    const { data } = await api.get<Post[]>("/posts", { params: query(params) });
    return data;
  },
  async createPost(body: string): Promise<Post> {
    const { data } = await api.post<Post>("/posts", { body });
    return data;
  },
  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${encodeURIComponent(id)}`);
  },
  async like(id: string): Promise<LikeState> {
    const { data } = await api.post<LikeState>(`/posts/${encodeURIComponent(id)}/like`);
    return data;
  },
  async unlike(id: string): Promise<LikeState> {
    const { data } = await api.delete<LikeState>(`/posts/${encodeURIComponent(id)}/like`);
    return data;
  },
  async comments(postId: string): Promise<PostComment[]> {
    const { data } = await api.get<PostComment[]>(`/posts/${encodeURIComponent(postId)}/comments`);
    return data;
  },
  async addComment(postId: string, body: string): Promise<PostComment> {
    const { data } = await api.post<PostComment>(`/posts/${encodeURIComponent(postId)}/comments`, { body });
    return data;
  },
  async deleteComment(id: string): Promise<void> {
    await api.delete(`/comments/${encodeURIComponent(id)}`);
  },

  async people(params: { search?: string; filter: PeopleFilter }): Promise<Person[]> {
    const { data } = await api.get<Person[]>("/people", {
      params: query({ search: params.search?.trim(), filter: params.filter }),
    });
    return data;
  },
  async follow(id: number): Promise<Person> {
    const { data } = await api.post<Person>(`/people/${id}/follow`);
    return data;
  },
  async unfollow(id: number): Promise<Person> {
    const { data } = await api.delete<Person>(`/people/${id}/follow`);
    return data;
  },
};

/** 422 codes from the backend ({ errors: { field: code } }) → keys under network.errors.validation */
export const VALIDATION_KEYS = {
  "body:empty": "bodyEmpty",
  "body:tooLong": "bodyTooLong",
  "userIds:notAllowed": "userIdsNotAllowed",
  "userIds:notFound": "userIdsNotFound",
  "title:required": "titleRequired",
  "title:tooLong": "titleTooLong",
} as const;

export type ValidationKey = (typeof VALIDATION_KEYS)[keyof typeof VALIDATION_KEYS];

const VALIDATION_EN: Record<ValidationKey, string> = {
  bodyEmpty: "Write something first",
  bodyTooLong: "That's too long — shorten it and try again",
  userIdsNotAllowed: "You can't start a chat with this person",
  userIdsNotFound: "That person no longer has an account",
  titleRequired: "Give the group a name",
  titleTooLong: `Group names are limited to ${LIMITS.groupTitle} characters`,
};

function isValidationCode(key: string): key is keyof typeof VALIDATION_KEYS {
  return key in VALIDATION_KEYS;
}

function validationText(data: unknown, texts: Record<ValidationKey, string>): string | null {
  if (typeof data !== "object" || data === null || !("errors" in data)) return null;
  const errors = (data as { errors: unknown }).errors;
  if (typeof errors !== "object" || errors === null) return null;
  for (const [field, code] of Object.entries(errors)) {
    const key = `${field}:${String(code)}`;
    if (typeof code === "string" && isValidationCode(key)) return texts[VALIDATION_KEYS[key]];
  }
  return null;
}

export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

/** Human message for a failed network call (the auth helper would call every 401 a bad password) */
export interface NetworkErrorText {
  sessionExpired: string;
  forbidden: string;
  notFound: string;
  offline: string;
  /** any other failure — the raw server text is never shown */
  generic: string;
  validation: Record<ValidationKey, string>;
}

/** English fallback; hooks pass the translated set from the `network` namespace */
const NETWORK_ERROR_EN: NetworkErrorText = {
  sessionExpired: "Your session has expired — please sign in again",
  forbidden: "You don't have permission to do that",
  notFound: "Not found — it may have been deleted or you no longer have access",
  offline: "Can't reach the server — check your connection",
  generic: "Something went wrong — please try again",
  validation: VALIDATION_EN,
};

export function networkError(error: unknown, text: NetworkErrorText = NETWORK_ERROR_EN): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 422) {
      const detail = validationText(error.response?.data, text.validation);
      if (detail) return detail;
    }
    if (status === 401) return text.sessionExpired;
    if (status === 403) return text.forbidden;
    if (status === 404) return text.notFound;
    if (!error.response) return text.offline;
  }
  return text.generic;
}
