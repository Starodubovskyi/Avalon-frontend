"use client";

import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { LIMITS, type UserCard } from "@/lib/network/api";
import { firstName, personName } from "@/lib/network/format";
import { Avatar, btn, Spinner } from "../ui/primitives";
import { CharCounter } from "../network/bits";
import { useAutosize } from "../network/useAutosize";

export function PostComposer({ me, onSubmit }: { me: UserCard; onSubmit: (body: string) => Promise<boolean> }) {
  const id = useId();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosize(ref, value, 320);

  const body = value.trim();
  const over = value.length > LIMITS.post;
  const canPost = body.length > 0 && !over && !busy;

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!canPost) return;
    setBusy(true);
    const ok = await onSubmit(body);
    setBusy(false);
    if (ok) setValue("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void submit();
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border bg-card p-4 shadow-card transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 sm:p-5"
    >
      <div className="flex gap-3">
        <Avatar name={personName(me)} className="h-10 w-10 text-sm" />
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="sr-only">
            Write a post
          </label>
          <textarea
            id={id}
            ref={ref}
            rows={2}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`What's new on the water, ${firstName(me)}?`}
            aria-invalid={over || undefined}
            className="min-h-[52px] w-full resize-none bg-transparent py-2 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/80 sm:text-[15px]"
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
        <span className="flex min-w-0 items-center gap-3">
          <CharCounter length={value.length} max={LIMITS.post} />
          <span className="hidden text-[11px] text-muted-foreground sm:inline">Ctrl + Enter to post</span>
        </span>
        <button type="submit" disabled={!canPost} className={btn.primary}>
          {busy ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <Send className="h-4 w-4" aria-hidden />}
          Post
        </button>
      </div>
    </form>
  );
}
