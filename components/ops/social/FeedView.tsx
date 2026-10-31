"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Globe2, Newspaper, UserCheck, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/useAuth";
import type { FeedScope } from "@/lib/network/api";
import { useFeed, useFeedActions, useNow } from "@/lib/network/hooks";
import { toUserCard } from "@/lib/network/format";
import { btn, EmptyState, ErrorBlock, LoadingBlock, PageHeader, Spinner } from "../ui/primitives";
import { focusRing } from "../network/bits";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";

const TABS: { id: FeedScope; label: string; icon: typeof Globe2 }[] = [
  { id: "all", label: "All", icon: Globe2 },
  { id: "following", label: "Following", icon: UserCheck },
];

export function FeedView() {
  const { user } = useAuth();
  const me = useMemo(() => (user ? toUserCard(user) : null), [user]);
  const [scope, setScope] = useState<FeedScope>("all");
  const feed = useFeed(scope);
  const actions = useFeedActions(feed.mutate);
  const now = useNow();
  const { posts, hasMore, loadingMore } = feed;
  const firstLoad = feed.isLoading && !feed.data;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <PageHeader
        eyebrow="Network"
        title="Feed"
        subtitle="News from the Avalon team and partners — port updates, arrivals, wins."
      />

      {me ? <PostComposer me={me} onSubmit={actions.createPost} /> : null}

      <div className="grid w-full grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold sm:w-72" role="tablist" aria-label="Feed filter">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = scope === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setScope(t.id)}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all",
                  focusRing,
                  active ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden /> {t.label}
              </button>
            );
          })}
      </div>

      {feed.error && !feed.data ? <ErrorBlock error={feed.error} onRetry={() => void feed.mutate()} /> : null}
      {firstLoad ? <LoadingBlock label="Loading feed…" /> : null}

      {feed.data && !posts.length ? (
        <div className="rounded-2xl border bg-card shadow-card">
          {scope === "following" ? (
            <EmptyState
              icon={<UsersRound className="h-7 w-7" />}
              title="Nothing from people you follow yet"
              text="Follow colleagues and partners to see their posts here. Your own posts show up too."
              action={
                <Link href="/people" className={btn.primary}>
                  <UsersRound className="h-4 w-4" aria-hidden /> Find people
                </Link>
              }
            />
          ) : (
            <EmptyState icon={<Newspaper className="h-7 w-7" />} title="No posts yet" text="Be the first to share an update with the team." />
          )}
        </div>
      ) : null}

      {posts.length ? (
        <ul className="space-y-4" aria-label="Posts">
          {posts.map((p) => (
            <li key={p.id}>
              <PostCard post={p} now={now} actions={actions} />
            </li>
          ))}
        </ul>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center pb-4">
          <button type="button" onClick={() => void feed.setSize(feed.size + 1)} disabled={loadingMore} className={btn.secondary}>
            {loadingMore ? <Spinner className="h-4 w-4" /> : null}
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : posts.length ? (
        <p className="pb-4 text-center text-xs text-muted-foreground">You&apos;re all caught up</p>
      ) : null}
    </div>
  );
}
