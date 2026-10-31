"use client";

import { useState, type FormEvent } from "react";
import { Check, ChevronRight, MessageCirclePlus, Search, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LIMITS, type Conversation, type UserCard } from "@/lib/network/api";
import { useChatActions, useDebounced, useDirectory } from "@/lib/network/hooks";
import { personName } from "@/lib/network/format";
import { Avatar, btn, ErrorBlock, Field, Spinner, TextInput } from "../ui/primitives";
import { focusRing, PersonRoleBadge } from "../network/bits";

export type NewChatMode = "direct" | "group";

export function NewConversationDialog({
  mode,
  onOpenChange,
  onCreated,
}: {
  mode: NewChatMode | null;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversation: Conversation) => void;
}) {
  // A fresh form per opening; the last mode stays while the close animation runs
  const [session, setSession] = useState<{ key: number; mode: NewChatMode; open: boolean }>({ key: 0, mode: "direct", open: false });
  if ((mode !== null) !== session.open) {
    setSession((s) => ({ key: mode ? s.key + 1 : s.key, mode: mode ?? s.mode, open: mode !== null }));
  }

  return (
    <Dialog open={mode !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92svh] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 shadow-elevated sm:rounded-2xl">
        <NewConversationForm key={session.key} initialMode={mode ?? session.mode} onCancel={() => onOpenChange(false)} onCreated={onCreated} />
      </DialogContent>
    </Dialog>
  );
}

function NewConversationForm({
  initialMode,
  onCancel,
  onCreated,
}: {
  initialMode: NewChatMode;
  onCancel: () => void;
  onCreated: (conversation: Conversation) => void;
}) {
  const [mode, setMode] = useState<NewChatMode>(initialMode);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserCard[]>([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState<number | "group" | null>(null);
  const { createConversation } = useChatActions();
  const { data, error, isLoading, mutate } = useDirectory(useDebounced(search), true);
  const people = data ?? [];
  const group = mode === "group";
  const groupReady = selected.length >= 2 && title.trim().length > 0 && title.trim().length <= LIMITS.groupTitle;

  async function start(input: { userIds: number[]; title?: string }, marker: number | "group") {
    setBusy(marker);
    const conv = await createConversation(input).catch(() => null);
    setBusy(null);
    if (conv) onCreated(conv);
  }

  function toggle(u: UserCard) {
    setSelected((cur) => (cur.some((s) => s.id === u.id) ? cur.filter((s) => s.id !== u.id) : [...cur, u]));
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (group && groupReady && busy === null) void start({ userIds: selected.map((u) => u.id), title: title.trim() }, "group");
  }

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start gap-3 border-b px-6 pb-4 pt-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {group ? <Users className="h-5 w-5" aria-hidden /> : <MessageCirclePlus className="h-5 w-5" aria-hidden />}
        </span>
        <DialogHeader className="min-w-0 space-y-1 pr-6 text-left">
          <DialogTitle className="font-display text-lg font-bold">{group ? "New group" : "New chat"}</DialogTitle>
          <DialogDescription>{group ? "Name the group and pick at least two people." : "Pick a person to message. An existing chat opens if you already have one."}</DialogDescription>
        </DialogHeader>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold" role="tablist" aria-label="Conversation type">
          {(["direct", "group"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn("rounded-lg py-2 transition-all", focusRing, mode === m ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground")}
            >
              {m === "direct" ? "Direct" : "Group"}
            </button>
          ))}
        </div>

        {group ? (
          <Field label="Group name" hint={`${title.trim().length} / ${LIMITS.groupTitle}`}>
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} maxLength={LIMITS.groupTitle} placeholder="e.g. MV Delta Star — Sulina call" className="text-base sm:text-sm" />
          </Field>
        ) : null}

        {group && selected.length ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Selected people">
            {selected.map((u) => (
              <li key={u.id}>
                <button type="button" onClick={() => toggle(u)} className={cn("inline-flex items-center gap-1.5 rounded-full border bg-primary/[0.06] py-1 pl-1 pr-2 text-xs font-medium transition hover:border-bad/40", focusRing)} aria-label={`Remove ${personName(u)}`}>
                  <Avatar name={personName(u)} className="h-5 w-5 text-[9px]" />
                  {personName(u)}
                  <X className="h-3 w-3 text-muted-foreground" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <TextInput type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" aria-label="Search people" className="pl-9 text-base sm:text-sm" autoFocus />
        </div>

        {error ? <ErrorBlock error={error} onRetry={() => void mutate()} /> : null}
        {isLoading && !data ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : !people.length && data ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{search.trim() ? "Nobody matches that search." : "No one to message yet."}</p>
        ) : (
          <ul className="-mx-2 space-y-0.5" aria-label="People">
            {people.map((u) => {
              const name = personName(u);
              const checked = selected.some((s) => s.id === u.id);
              const rowBusy = busy === u.id;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => (group ? toggle(u) : void start({ userIds: [u.id] }, u.id))}
                    disabled={busy !== null && !group}
                    aria-pressed={group ? checked : undefined}
                    className={cn("flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-accent/60 disabled:opacity-60", focusRing, checked && "bg-primary/[0.06]")}
                  >
                    <Avatar name={name} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">{name}</span>
                        <PersonRoleBadge role={u.role} compact />
                      </span>
                      {u.email ? <span className="block truncate text-xs text-muted-foreground">{u.email}</span> : null}
                    </span>
                    {group ? (
                      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border-2 transition", checked ? "border-primary bg-primary text-primary-foreground" : "border-input")} aria-hidden>
                        {checked ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                    ) : rowBusy ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {group ? (
        <div className="flex flex-col-reverse gap-2 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <span className="text-xs text-muted-foreground sm:mr-auto">{selected.length} selected{selected.length < 2 ? " · pick at least 2" : ""}</span>
          <button type="button" onClick={onCancel} className={btn.secondary}>Cancel</button>
          <button type="submit" disabled={!groupReady || busy !== null} className={btn.primary}>
            {busy === "group" ? <Spinner className="h-4 w-4 text-primary-foreground" /> : <Users className="h-4 w-4" aria-hidden />}
            Create group
          </button>
        </div>
      ) : null}
    </form>
  );
}
