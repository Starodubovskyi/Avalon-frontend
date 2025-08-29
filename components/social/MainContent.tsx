"use client";

import React, { useState } from "react";
import PostCard from "./PostCard";
import { Image, Video, Link, Tag, Smile, MapPin } from "lucide-react";

interface UserInfo {
  name: string;
  handle: string;
  country: string;
  photo: string;
}

interface Post {
  id: string;
  user: UserInfo;
  time: string;
  content: string;
  image?: string;
}

interface MainContentProps {
  currentUser: UserInfo;
}

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const MainContent: React.FC<MainContentProps> = ({ currentUser }) => {
  if (!currentUser) {
    return <div>Загрузка данных пользователя...</div>;
  }

  const [postText, setPostText] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "post_richard_1",
      user: {
        name: "Richard Smith",
        handle: "@RICHARD4842",
        country: "United Kingdom",
        photo: "https://placehold.co/40x40/5a67d8/ffffff?text=RS",
      },
      time: "About 1 hr ago",
      content:
        "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. #Motivation #Monday #Inspiration",
      image: "https://placehold.co/600x400/5a67d8/ffffff?text=Motivation",
    },
  ]);

  const [likes, setLikes] = useState<Record<string, boolean>>({});

  const handleSharePost = () => {
    const text = postText.trim();
    if (!text) return;
    const newPost: Post = {
      id: genId(),
      user: currentUser,
      time: "Just now",
      content: text,
    };
    setPosts((prev) => [newPost, ...prev]);
    setPostText("");
  };

  const handleLikeToggle = (post: Post, liked: boolean) => {
    setLikes((prev) => ({ ...prev, [post.id]: liked }));
  };

  const handleAddComment = (post: Post, text: string) => {
    console.log("New comment for post:", post.id, text);
  };

  const handleShareToMessages = (post: Post) => {
    window.dispatchEvent(
      new CustomEvent("app:share-to-messages", { detail: { post } })
    );
  };

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)] p-4 sm:p-6">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-3 sm:mb-4">
          Create Post
        </h3>

        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <img
            src={currentUser.photo}
            alt={currentUser.name}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
          />
          <input
            type="text"
            placeholder="What's on your mind?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="flex-1 px-3 py-2 text-sm sm:text-base bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-gray-500 dark:text-gray-400">
          <div className="flex flex-wrap gap-4">
            <button aria-label="Add image" type="button">
              <Image size={20} />
            </button>
            <button aria-label="Add video" type="button">
              <Video size={20} />
            </button>
            <button aria-label="Add link" type="button">
              <Link size={20} />
            </button>
            <button aria-label="Add tags" type="button">
              <Tag size={20} />
            </button>
            <button aria-label="Add emoji" type="button">
              <Smile size={20} />
            </button>
            <button aria-label="Add location" type="button">
              <MapPin size={20} />
            </button>
          </div>

          <button
            onClick={handleSharePost}
            type="button"
            className="self-end sm:self-auto w-full sm:w-auto text-sm sm:text-base bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 sm:px-6 rounded-xl transition-colors"
          >
            Share Post
          </button>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)] p-4 sm:p-6">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
          Popular Channels
        </h3>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            defaultLiked={!!likes[post.id]}
            onLikeToggle={handleLikeToggle}
            onAddComment={handleAddComment}
            onShareToMessages={handleShareToMessages}
          />
        ))}
      </div>
    </div>
  );
};

export default MainContent;
