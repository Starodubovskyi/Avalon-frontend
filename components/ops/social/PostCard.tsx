"use client";

import { useCallback, useRef, useState } from "react";
import { Heart, MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/lib/network/api";
import type { FeedActions } from "@/lib/network/hooks";
import { feedTime, fullTime, personName } from "@/lib/network/format";
import { Avatar, btn, Spinner } from "../ui/primitives";
import { PersonRoleBadge } from "../network/bits";
import { PostComments } from "./PostComments";

export function PostCard({ post, now, actions }: { post: Post; now: number; actions: FeedActions }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const liking = useRef(false);
  const name = personName(post.author);
  const commentsId = `comments-${post.id}`;
  const { toggleLike, removePost, adjustComments } = actions;

  const onCountChange = useCallback((delta: number) => void adjustComments(post.id, delta), [adjustComments, post.id]);

  async function like() {
    if (liking.current) return;
    liking.current = true;
    await toggleLike(post);
    liking.current = false;
  }

  async function remove() {
    if (!window.confirm("Delete this post? Its likes and comments go with it.")) return;
    setDeleting(true);
    const ok = await removePost(post);
    if (!ok) setDeleting(false);
  }

  return (
    <article className="rounded-2xl border bg-card shadow-card transition hover:shadow-elevated" aria-label={`Post by ${name}`}>
      <header className="flex items-start gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <Avatar name={name} className="h-10 w-10 text-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-semibold">{name}</span>
            <PersonRoleBadge role={post.author.role} compact />
          </div>
          <time dateTime={post.createdAt} title={fullTime(post.createdAt)} className="text-xs text-muted-foreground">
            {feedTime(post.createdAt, now)}
          </time>
        </div>
        {post.canDelete ? (
          <button
            type="button"
            onClick={() => void remove()}
            disabled={deleting}
            className={cn(btn.icon, "-mr-1.5 -mt-1 hover:bg-bad/10 hover:text-bad")}
            aria-label="Delete post"
            title="Delete post"
          >
            {deleting ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" aria-hidden />}
          </button>
        ) : null}
      </header>

      <p className="whitespace-pre-wrap break-words px-4 py-3 text-[15px] leading-relaxed [overflow-wrap:anywhere] sm:px-5">{post.body}</p>

      <footer className="flex items-center gap-1 border-t px-2 py-1.5 sm:px-3">
        <button
          type="button"
          onClick={() => void like()}
          aria-pressed={post.likedByMe}
          aria-label={`${post.likedByMe ? "Unlike" : "Like"} post, ${post.likeCount} ${post.likeCount === 1 ? "like" : "likes"}`}
          className={cn(btn.ghost, post.likedByMe && "text-bad hover:text-bad")}
        >
          <Heart className={cn("h-4 w-4 transition-transform", post.likedByMe && "scale-110 fill-current")} aria-hidden />
          <span className="tabular">{post.likeCount}</span>
          <span className="hidden sm:inline">{post.likedByMe ? "Liked" : "Like"}</span>
        </button>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={commentsId}
          aria-label={`${open ? "Hide" : "Show"} comments, ${post.commentCount}`}
          className={cn(btn.ghost, open && "bg-accent text-accent-foreground")}
        >
          <MessageSquare className="h-4 w-4" aria-hidden />
          <span className="tabular">{post.commentCount}</span>
          <span className="hidden sm:inline">{post.commentCount === 1 ? "Comment" : "Comments"}</span>
        </button>
      </footer>

      {open ? <PostComments id={commentsId} postId={post.id} now={now} onCountChange={onCountChange} /> : null}
    </article>
  );
}
