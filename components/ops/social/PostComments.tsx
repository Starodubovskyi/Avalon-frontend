"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import { LIMITS, type PostComment } from "@/lib/network/api";
import { useCommentActions, useComments } from "@/lib/network/hooks";
import { feedTime, fullTime, personName } from "@/lib/network/format";
import { displayName } from "@/lib/auth/roles";
import { Avatar, btn, ErrorBlock, Spinner } from "../ui/primitives";
import { CharCounter, focusRing } from "../network/bits";
import { useAutosize } from "../network/useAutosize";

export function PostComments({
  id,
  postId,
  now,
  onCountChange,
}: {
  id: string;
  postId: string;
  now: number;
  onCountChange: (delta: number) => void;
}) {
  const { user } = useAuth();
  const { data, error, isLoading, mutate } = useComments(postId, true);
  const { addComment, removeComment } = useCommentActions(postId, onCountChange);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosize(ref, value, 140);

  const body = value.trim();
  const over = value.length > LIMITS.comment;
  const canSend = body.length > 0 && !over && !busy;

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSend) return;
    setBusy(true);
    const ok = await addComment(body);
    setBusy(false);
    if (ok) setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void submit();
    }
  }

  async function remove(comment: PostComment) {
    if (!window.confirm("Delete this comment?")) return;
    setRemoving(comment.id);
    await removeComment(comment);
    setRemoving(null);
  }

  const comments = data ?? [];

  return (
    <div id={id} className="space-y-3 rounded-b-2xl border-t bg-muted/30 px-4 py-4 sm:px-5">
      {isLoading && !data ? (
        <div className="flex justify-center py-3">
          <Spinner className="h-4 w-4" />
        </div>
      ) : null}
      {error && !data ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
      {data && !comments.length ? <p className="text-sm text-muted-foreground">No comments yet — be the first to reply.</p> : null}

      {comments.length ? (
        <ul className="space-y-3" aria-label="Comments">
          {comments.map((c) => {
            const name = personName(c.author);
            return (
              <li key={c.id} className="flex gap-2.5">
                <Avatar name={name} className="h-8 w-8 text-[11px]" />
                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl rounded-tl-md border bg-card px-3.5 py-2 shadow-card">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold">{name}</span>
                      <time dateTime={c.createdAt} title={fullTime(c.createdAt)} className="shrink-0 text-[11px] text-muted-foreground">
                        {feedTime(c.createdAt, now)}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]">{c.body}</p>
                  </div>
                  {c.canDelete ? (
                    <button
                      type="button"
                      onClick={() => void remove(c)}
                      disabled={removing === c.id}
                      className={cn("ml-2 mt-1 rounded text-[11px] font-medium text-muted-foreground transition hover:text-bad disabled:opacity-50", focusRing)}
                      aria-label={`Delete comment by ${name}`}
                    >
                      {removing === c.id ? "Deleting…" : "Delete"}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <form onSubmit={submit} className="flex items-end gap-2.5">
        <Avatar name={displayName(user) || "You"} className="mb-0.5 h-8 w-8 text-[11px]" />
        <div className="min-w-0 flex-1">
          <div className="flex items-end gap-1.5 rounded-2xl border border-input bg-card p-1 pl-3 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
            <textarea
              ref={ref}
              rows={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Write a comment…"
              aria-label="Write a comment"
              aria-invalid={over || undefined}
              className="min-h-[32px] flex-1 resize-none bg-transparent py-1.5 text-base leading-5 text-foreground outline-none placeholder:text-muted-foreground/80 sm:text-sm"
            />
            <button type="submit" disabled={!canSend} className={cn(btn.primary, "h-8 w-8 shrink-0 rounded-xl px-0")} aria-label="Post comment">
              {busy ? <Spinner className="h-3.5 w-3.5 text-primary-foreground" /> : <Send className="h-3.5 w-3.5" aria-hidden />}
            </button>
          </div>
          <CharCounter length={value.length} max={LIMITS.comment} showFrom={LIMITS.comment - 200} className="ml-3 mt-1 block" />
        </div>
      </form>
    </div>
  );
}
