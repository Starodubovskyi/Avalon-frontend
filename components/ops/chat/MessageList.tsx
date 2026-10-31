"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNow, type ChatMessageView } from "@/lib/network/hooks";
import { sameUser } from "@/lib/network/format";
import { ErrorBlock, LoadingBlock } from "../ui/primitives";
import { focusRing } from "../network/bits";
import { MessageBubble } from "./MessageBubble";
import { buildRows } from "./chatRows";

const STICK_PX = 96;

export function MessageList({
  messages,
  meId,
  isGroup,
  loading,
  error,
  onRetry,
  empty,
}: {
  messages: ChatMessageView[];
  meId: number;
  isGroup: boolean;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  empty: ReactNode;
}) {
  const now = useNow();
  const rows = useMemo(() => buildRows(messages, now), [messages, now]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const seenRef = useRef<string | null>(null);
  const [unseen, setUnseen] = useState(false);
  const last = messages[messages.length - 1];

  // Follow new messages while the reader is at the bottom (or just sent one); otherwise offer a jump pill
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !last || seenRef.current === last.id) return;
    const initial = seenRef.current === null;
    seenRef.current = last.id;
    if (initial || stickRef.current || sameUser(last.sender.id, meId)) {
      el.scrollTo({ top: el.scrollHeight, behavior: initial ? "auto" : "smooth" });
      stickRef.current = true;
      setUnseen(false);
    } else {
      setUnseen(true);
    }
  }, [last, meId]);

  // Keep the bottom in view when the composer grows or the phone keyboard opens
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (stickRef.current) el.scrollTop = el.scrollHeight;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_PX;
    stickRef.current = near;
    if (near) setUnseen(false);
  }

  function jumpToEnd() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    stickRef.current = true;
    setUnseen(false);
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto overscroll-contain px-3 pb-4 pt-2 sm:px-6">
        {loading && !messages.length ? <LoadingBlock label="Loading messages…" /> : null}
        {error && !messages.length ? (
          <div className="py-6">
            <ErrorBlock error={error} onRetry={onRetry} />
          </div>
        ) : null}
        {!loading && !error && !messages.length ? empty : null}
        {messages.length ? (
          <ol role="log" aria-label="Messages" aria-relevant="additions" className="flex flex-col">
            {rows.map((row) =>
              row.type === "day" ? (
                <li key={row.key} className="sticky top-0 z-[1] flex justify-center py-3" aria-label={row.label}>
                  <span className="glass rounded-full border px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-card">
                    {row.label}
                  </span>
                </li>
              ) : (
                <MessageBubble
                  key={row.key}
                  message={row.message}
                  mine={sameUser(row.message.sender.id, meId)}
                  isGroup={isGroup}
                  first={row.first}
                  last={row.last}
                />
              ),
            )}
          </ol>
        ) : null}
      </div>
      {unseen ? (
        <button
          type="button"
          onClick={jumpToEnd}
          className={cn(
            "animate-in-up absolute inset-x-0 bottom-3 mx-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-elevated",
            focusRing,
          )}
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden /> New messages
        </button>
      ) : null}
    </div>
  );
}
