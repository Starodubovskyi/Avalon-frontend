"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { LIMITS } from "@/lib/network/api";
import { btn } from "../ui/primitives";
import { CharCounter } from "../network/bits";
import { useAutosize } from "../network/useAutosize";

/** Enter sends, Shift+Enter breaks the line; a rejected message comes back into the box */
export function MessageComposer({
  onSend,
  placeholder = "Write a message…",
}: {
  onSend: (body: string) => Promise<boolean>;
  placeholder?: string;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutosize(ref, value, 160);

  const body = value.trim();
  const over = value.length > LIMITS.message;
  const canSend = body.length > 0 && !over;

  function submit() {
    if (!canSend) return;
    setValue("");
    ref.current?.focus();
    void onSend(body).then((ok) => {
      if (!ok) setValue((current) => current || body);
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="border-t bg-card px-3 pb-3 pt-3 sm:px-5"
    >
      <div className="flex items-end gap-2 rounded-2xl border border-input bg-background/60 p-1.5 pl-3.5 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        <label htmlFor={id} className="sr-only">
          Message
        </label>
        <textarea
          id={id}
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-invalid={over || undefined}
          className="min-h-[36px] flex-1 resize-none bg-transparent py-2 text-base leading-5 text-foreground outline-none placeholder:text-muted-foreground/80 sm:text-sm"
        />
        <button
          type="submit"
          disabled={!canSend}
          className={cn(btn.primary, "h-9 w-9 shrink-0 rounded-xl px-0")}
          aria-label="Send message"
          title="Send (Enter)"
        >
          <SendHorizontal className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="mt-1.5 flex min-h-4 items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
        <span className="hidden sm:inline">Enter to send · Shift + Enter for a new line</span>
        <CharCounter length={value.length} max={LIMITS.message} showFrom={LIMITS.message - 400} className="ml-auto" />
      </div>
    </form>
  );
}
