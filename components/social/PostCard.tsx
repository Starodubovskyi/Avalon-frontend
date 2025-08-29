"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Heart, MessageCircle, Share2, Copy } from "lucide-react";

type CommentItem = {
  id: string;
  author: string;
  text: string;
  time: string;
};

interface PostCardProps {
  post: {
    id: string; // важный стабильный идентификатор
    user: {
      name: string;
      handle: string;
      country: string;
      photo: string;
    };
    time: string;
    content: string;
    image?: string;
  };
  onShareToMessages?: (post: PostCardProps["post"]) => void;
  onLikeToggle?: (post: PostCardProps["post"], liked: boolean) => void;
  onAddComment?: (post: PostCardProps["post"], text: string) => void;
  defaultLiked?: boolean;
  defaultComments?: CommentItem[];
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onShareToMessages,
  onLikeToggle,
  onAddComment,
  defaultLiked = false,
  defaultComments = [],
}) => {
  const [liked, setLiked] = useState(defaultLiked);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>(defaultComments);
  const [commentText, setCommentText] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Закрытие меню по клику вне
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // ВАЖНО: синхронизируем локальный стейт при смене поста
  useEffect(() => {
    setLiked(defaultLiked);
    setComments(defaultComments);
    setCommentsOpen(false);
    setMenuOpen(false);
    setCommentText("");
  }, [post.id, defaultLiked, defaultComments]);

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    onLikeToggle?.(post, next);
  };

  const handleShareToMessages = () => {
    if (onShareToMessages) onShareToMessages(post);
    else {
      window.dispatchEvent(
        new CustomEvent("app:share-to-messages", { detail: { post } })
      );
    }
    setMenuOpen(false);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(post.content);
    } catch {}
    setMenuOpen(false);
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${post.user.name} — post`,
          text: post.content,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        });
      } else {
        await handleCopyText();
      }
    } catch {}
    setMenuOpen(false);
  };

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    const item: CommentItem = {
      id: `${post.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      author: "You",
      text,
      time: "now",
    };
    setComments((prev) => [item, ...prev]);
    onAddComment?.(post, text);
    setCommentText("");
    setCommentsOpen(true);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)] p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={post.user.photo}
            alt={post.user.name}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          <div className="leading-tight">
            <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
              {post.user.name}
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              {post.user.handle} • {post.user.country}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 relative">
          <span className="text-[11px] sm:text-xs">{post.time}</span>
          <button
            aria-label="More"
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-7 z-50 w-56 rounded-xl border border-gray-200 bg-white shadow-lg dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)] overflow-hidden"
            >
              <button
                type="button"
                onClick={handleShareToMessages}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <Share2 className="w-4 h-4" />
                Share to Messages
              </button>
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <Share2 className="w-4 h-4" />
                System Share…
              </button>
              <button
                type="button"
                onClick={handleCopyText}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <Copy className="w-4 h-4" />
                Copy text
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div>
        <p className="text-[15px] sm:text-base leading-relaxed text-gray-900 dark:text-white mb-3 sm:mb-4 break-words">
          {post.content}
        </p>
        {post.image && (
          <img
            src={post.image}
            alt="Post"
            className="w-full rounded-2xl mb-3 sm:mb-4 object-cover"
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between sm:justify-around text-gray-600 dark:text-gray-300 mt-3 sm:mt-4">
        <button
          type="button"
          onClick={handleLike}
          className="flex items-center gap-2 text-sm sm:text-base rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-pressed={liked}
        >
          <Heart
            size={18}
            className={liked ? "text-red-500" : undefined}
            fill={liked ? "currentColor" : "none"}
          />
          <span className={liked ? "text-red-500 font-medium" : undefined}>
            {liked ? "Liked" : "Like"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className="flex items-center gap-2 text-sm sm:text-base rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <MessageCircle size={18} />
          <span>Comment{comments.length ? ` (${comments.length})` : ""}</span>
        </button>

        <button
          type="button"
          onClick={handleShareToMessages}
          className="flex items-center gap-2 text-sm sm:text-base rounded-lg px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          title="Share to Messages"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments */}
      {commentsOpen && (
        <div className="mt-4 border-t border-gray-200 dark:border-white/10 pt-3">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-white/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitComment();
                }
              }}
            />
            <button
              type="button"
              onClick={submitComment}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            >
              Send
            </button>
          </div>

          <ul className="space-y-2">
            {comments.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-gray-200 dark:border-white/10 px-3 py-2"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {c.author} • {c.time}
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {c.text}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PostCard;
