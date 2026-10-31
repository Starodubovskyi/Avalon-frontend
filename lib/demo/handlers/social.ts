import type { Post, PostComment } from "@/lib/network/api";
import { isoAfter, uuid } from "../ids";
import {
  bodyText,
  byNewest,
  created,
  forbidden,
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
import { canDeleteContent, canSeeUser, cardById, findUser } from "../presenters";
import type { CommentRow, DemoState, DemoUserRow, PostRow } from "../types";

/** /posts, /comments — team feed; viewers only see posts/comments by the team (and their own) */

const POST_MAX = 5000;
const COMMENT_MAX = 2000;

function visibleAuthor(state: DemoState, viewer: DemoUserRow, authorId: number): boolean {
  if (authorId === viewer.id) return true;
  const author = findUser(state, authorId);
  return !!author && canSeeUser(viewer, author);
}

function visibleComments(state: DemoState, viewer: DemoUserRow, postId: string): CommentRow[] {
  return state.comments.filter((c) => c.postId === postId && !c.deletedAt && visibleAuthor(state, viewer, c.authorId));
}

function toPost(state: DemoState, p: PostRow, viewer: DemoUserRow): Post {
  return {
    id: p.id,
    author: cardById(state, p.authorId),
    body: p.body,
    createdAt: p.createdAt,
    likeCount: state.likes.filter((l) => l.postId === p.id).length,
    commentCount: visibleComments(state, viewer, p.id).length,
    likedByMe: state.likes.some((l) => l.postId === p.id && l.userId === viewer.id),
    canDelete: canDeleteContent(viewer, p.authorId),
  };
}

function toComment(state: DemoState, c: CommentRow, viewer: DemoUserRow): PostComment {
  return { id: c.id, postId: c.postId, author: cardById(state, c.authorId), body: c.body, createdAt: c.createdAt, canDelete: canDeleteContent(viewer, c.authorId) };
}

function activePost(req: DemoRequest): PostRow {
  const id = uuidParam(req);
  return req.state.posts.find((p) => p.id === id && !p.deletedAt) ?? notFound("Post not found");
}

function feed(req: DemoRequest) {
  const user = requireUser(req);
  const scope = req.query.scope ?? "all";
  if (scope !== "all" && scope !== "following") invalid({ scope: "scope must be one of the following values: all, following" });
  const before = isoQuery(req, "before");
  const limit = intQuery(req, "limit", 1, 50) ?? 20;
  const { state } = req;
  const followees = new Set(state.follows.filter((f) => f.followerId === user.id).map((f) => f.followeeId));
  const cursor = before ? new Date(before).toISOString() : null;
  const rows = state.posts
    .filter((p) => !p.deletedAt && visibleAuthor(state, user, p.authorId))
    .filter((p) => scope === "all" || p.authorId === user.id || followees.has(p.authorId))
    .filter((p) => !cursor || p.createdAt < cursor)
    .sort(byNewest)
    .slice(0, limit);
  return ok(rows.map((p) => toPost(state, p, user)));
}

function createPost(req: DemoRequest) {
  const user = requireUser(req);
  const body = bodyText(req, "body", POST_MAX);
  const row: PostRow = { id: uuid(), authorId: user.id, body, createdAt: isoAfter(null), deletedAt: null };
  req.state.posts.push(row);
  return created(toPost(req.state, row, user));
}

function removePost(req: DemoRequest) {
  const user = requireUser(req);
  const post = activePost(req);
  if (!canDeleteContent(user, post.authorId)) forbidden("Forbidden");
  post.deletedAt = new Date().toISOString();
  return noContent();
}

function likeState(state: DemoState, postId: string, likedByMe: boolean) {
  return { likeCount: state.likes.filter((l) => l.postId === postId).length, likedByMe };
}

function like(req: DemoRequest) {
  const user = requireUser(req);
  const post = activePost(req);
  if (!req.state.likes.some((l) => l.postId === post.id && l.userId === user.id)) req.state.likes.push({ postId: post.id, userId: user.id });
  return ok(likeState(req.state, post.id, true));
}

function unlike(req: DemoRequest) {
  const user = requireUser(req);
  const post = activePost(req);
  req.state.likes = req.state.likes.filter((l) => !(l.postId === post.id && l.userId === user.id));
  return ok(likeState(req.state, post.id, false));
}

function comments(req: DemoRequest) {
  const user = requireUser(req);
  const post = activePost(req);
  const rows = visibleComments(req.state, user, post.id).sort(byNewest).slice(0, 200).reverse();
  return ok(rows.map((c) => toComment(req.state, c, user)));
}

function addComment(req: DemoRequest) {
  const user = requireUser(req);
  const post = activePost(req);
  const body = bodyText(req, "body", COMMENT_MAX);
  const row: CommentRow = { id: uuid(), postId: post.id, authorId: user.id, body, createdAt: isoAfter(null), deletedAt: null };
  req.state.comments.push(row);
  return created(toComment(req.state, row, user));
}

function removeComment(req: DemoRequest) {
  const user = requireUser(req);
  const id = uuidParam(req);
  const comment = req.state.comments.find((c) => c.id === id && !c.deletedAt) ?? notFound("Comment not found");
  if (!canDeleteContent(user, comment.authorId)) forbidden("Forbidden");
  comment.deletedAt = new Date().toISOString();
  return noContent();
}

export const socialRoutes: RouteDef[] = [
  ["GET", "/posts", feed],
  ["POST", "/posts", createPost],
  ["DELETE", "/posts/:id", removePost],
  ["POST", "/posts/:id/like", like],
  ["DELETE", "/posts/:id/like", unlike],
  ["GET", "/posts/:id/comments", comments],
  ["POST", "/posts/:id/comments", addComment],
  ["DELETE", "/comments/:id", removeComment],
];
