import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/network/api";
import { otherMembers, personName } from "@/lib/network/format";
import { Avatar } from "../ui/primitives";

export function ConversationAvatar({
  conversation,
  meId,
  className,
}: {
  conversation: Conversation;
  meId: number;
  className?: string;
}) {
  if (conversation.kind === "group") {
    return (
      <span
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary",
          className,
        )}
        aria-hidden
      >
        <Users className="h-[18px] w-[18px]" />
      </span>
    );
  }
  return <Avatar name={personName(otherMembers(conversation, meId)[0])} className={cn("h-10 w-10 text-sm", className)} />;
}
