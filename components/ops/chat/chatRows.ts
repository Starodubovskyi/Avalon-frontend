import type { ChatMessageView } from "@/lib/network/hooks";
import { dayKey, dayLabel } from "@/lib/network/format";

export type ChatRow =
  | { type: "day"; key: string; label: string }
  | { type: "message"; key: string; message: ChatMessageView; first: boolean; last: boolean };

/** Consecutive messages from one sender within 5 minutes read as one block */
const RUN_GAP_MS = 5 * 60_000;

function sameRun(a: ChatMessageView, b: ChatMessageView): boolean {
  return (
    a.sender.id === b.sender.id &&
    dayKey(a.createdAt) === dayKey(b.createdAt) &&
    Math.abs(Date.parse(b.createdAt) - Date.parse(a.createdAt)) < RUN_GAP_MS
  );
}

export function buildRows(messages: ChatMessageView[], now: number): ChatRow[] {
  const rows: ChatRow[] = [];
  let prevDay = "";
  messages.forEach((m, i) => {
    const day = dayKey(m.createdAt);
    if (day !== prevDay) {
      rows.push({ type: "day", key: `day-${day}`, label: dayLabel(m.createdAt, now) });
      prevDay = day;
    }
    const prev = messages[i - 1];
    const next = messages[i + 1];
    rows.push({
      type: "message",
      key: m.id,
      message: m,
      first: !prev || !sameRun(prev, m),
      last: !next || !sameRun(m, next),
    });
  });
  return rows;
}
