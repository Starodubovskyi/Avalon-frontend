"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
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

const TABS: { id: FeedScope; icon: typeof Globe2 }[] = [
  { id: "all", icon: Globe2 },
  { id: "following", icon: UserCheck },
];

export function FeedView() {
  const t = useTranslations("social");
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
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {me ? <PostComposer me={me} onSubmit={actions.createPost} /> : null}

      <div className="grid w-full grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold sm:w-72" role="tablist" aria-label={t("tabs.label")}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = scope === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setScope(tab.id)}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all",
                  focusRing,
                  active ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden /> <span className="truncate">{t(`tabs.${tab.id}`)}</span>
              </button>
            );
          })}
      </div>

      {feed.error && !feed.data ? <ErrorBlock error={feed.error} onRetry={() => void feed.mutate()} /> : null}
      {firstLoad ? <LoadingBlock label={t("loading")} /> : null}

      {feed.data && !posts.length ? (
        <div className="rounded-2xl border bg-card shadow-card">
          {scope === "following" ? (
            <EmptyState
              icon={<UsersRound className="h-7 w-7" />}
              title={t("emptyFollowingTitle")}
              text={t("emptyFollowingText")}
              action={
                <Link href="/people" className={btn.primary}>
                  <UsersRound className="h-4 w-4" aria-hidden /> {t("findPeople")}
                </Link>
              }
            />
          ) : (
            <EmptyState icon={<Newspaper className="h-7 w-7" />} title={t("emptyTitle")} text={t("emptyText")} />
          )}
        </div>
      ) : null}

      {posts.length ? (
        <ul className="space-y-4" aria-label={t("posts")}>
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
            {loadingMore ? t("loadingMore") : t("loadMore")}
          </button>
        </div>
      ) : posts.length ? (
        <p className="pb-4 text-center text-xs text-muted-foreground">{t("caughtUp")}</p>
      ) : null}
    </div>
  );
}
