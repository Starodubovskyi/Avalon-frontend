"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ChatMessageView } from "@/lib/network/hooks";
import { personName } from "@/lib/network/format";
import { Avatar } from "../ui/primitives";
import { useTimeFormat } from "../network/useTimeFormat";

export function MessageBubble({
  message,
  mine,
  isGroup,
  first,
  last,
}: {
  message: ChatMessageView;
  mine: boolean;
  isGroup: boolean;
  first: boolean;
  last: boolean;
}) {
  const t = useTranslations("chat.messages");
  const time = useTimeFormat();
  const name = personName(message.sender);
  const showPeer = isGroup && !mine;

  return (
    <li className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start", first ? "mt-3" : "mt-0.5")}>
      {showPeer ? (
        last ? <Avatar name={name} className="mb-5 h-7 w-7 text-[10px]" /> : <span className="w-7 shrink-0" aria-hidden />
      ) : null}
      <div className={cn("flex min-w-0 max-w-[82%] flex-col sm:max-w-[70%]", mine ? "items-end" : "items-start")}>
        {showPeer && first ? <span className="mb-1 px-1 text-xs font-semibold text-muted-foreground">{name}</span> : null}
        <div
          className={cn(
            "min-w-0 whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed [overflow-wrap:anywhere]",
            mine
              ? "bg-primary text-primary-foreground shadow-[0_6px_16px_-10px_hsl(var(--primary))]"
              : "border bg-muted/70 text-foreground",
            mine && last && "rounded-br-md",
            !mine && last && "rounded-bl-md",
            message.pending && "opacity-70",
          )}
        >
          <span className="sr-only">{mine ? t("you") : name}: </span>
          {message.body}
        </div>
        {last ? (
          <span className="tabular mt-1 px-1 text-[11px] text-muted-foreground">
            {message.pending ? (
              t("sending")
            ) : (
              <time dateTime={message.createdAt} title={time.full(message.createdAt)}>
                {time.clock(message.createdAt)}
              </time>
            )}
          </span>
        ) : null}
      </div>
    </li>
  );
}
