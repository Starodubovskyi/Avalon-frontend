"use client";

import React, { useState } from 'react';
import PostCard from './PostCard';
import { Image, Video, Link, Tag, Smile, MapPin } from 'lucide-react';

interface UserInfo {
  name: string;
  handle: string;
  country: string;
  photo: string;
}

interface Post {
  user: UserInfo;
  time: string;
  content: string;
  image?: string;
}

interface MainContentProps {
  currentUser: UserInfo;
}

const MainContent: React.FC<MainContentProps> = ({ currentUser }) => {
  if (!currentUser) {
    return <div>Загрузка данных пользователя...</div>;
  }

  const initialPosts: Post[] = [
    {
      user: {
        name: 'Richard Smith',
        handle: '@RICHARD4842',
        country: 'United Kingdom',
        photo: 'https://placehold.co/40x40/5a67d8/ffffff?text=RS',
      },
      time: 'About 1 hr ago',
      content:
        'Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. #Motivation #Monday #Inspiration',
      image: 'https://placehold.co/600x400/5a67d8/ffffff?text=Motivation',
    },
  ];

  const [postText, setPostText] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const handleSharePost = () => {
    if (postText.trim() !== '') {
      const newPost: Post = {
        user: currentUser,
        time: 'Just now',
        content: postText,
      };
      setPosts([newPost, ...posts]);
      setPostText('');
    }
  };

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white mb-3 sm:mb-4">
          Create Post
        </h3>

        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <img
            src={currentUser.photo}
            alt={currentUser.name}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
          />
          <input
            type="text"
            placeholder="What's on your mind?"
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            className="flex-1 px-3 py-2 text-sm sm:text-base bg-gray-100 dark:bg-gray-800 rounded-xl focus:outline-none dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-gray-500 dark:text-gray-400">
          <div className="flex flex-wrap gap-4">
            <button aria-label="Add image"><Image size={20} /></button>
            <button aria-label="Add video"><Video size={20} /></button>
            <button aria-label="Add link"><Link size={20} /></button>
            <button aria-label="Add tags"><Tag size={20} /></button>
            <button aria-label="Add emoji"><Smile size={20} /></button>
            <button aria-label="Add location"><MapPin size={20} /></button>
          </div>

          <button
            onClick={handleSharePost}
            className="self-end sm:self-auto w-full sm:w-auto text-sm sm:text-base bg-gray-900 dark:bg-[#2dd4bf] text-white font-semibold py-2 px-4 sm:px-6 rounded-xl hover:bg-gray-800 dark:hover:bg-[#14b8a6] transition-colors"
          >
            Share Post
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
          Popular Channels
        </h3>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {posts.map((post, i) => (
          <PostCard key={i} post={post} />
        ))}
      </div>
    </div>
  );
};

export default MainContent;
