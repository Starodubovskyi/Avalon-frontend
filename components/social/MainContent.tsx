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
      content: 'Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. #Motivation #Monday #Inspiration',
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
    <div className="flex-1 space-y-6">
      <div className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Create Post</h3>
        <div className="flex items-center space-x-4 mb-4">
          <img src={currentUser.photo} alt={currentUser.name} className="w-10 h-10 rounded-full" />
          <input
            type="text"
            placeholder="What's on your mind?"
            value={postText} 
            onChange={(e) => setPostText(e.target.value)} 
            className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl focus:outline-none dark:text-white"
          />
        </div>
        <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
          <div className="flex space-x-4">
            <button><Image size={20} /></button>
            <button><Video size={20} /></button>
            <button><Link size={20} /></button>
            <button><Tag size={20} /></button>
            <button><Smile size={20} /></button>
            <button><MapPin size={20} /></button>
          </div>
          <button
            onClick={handleSharePost} 
            className="bg-gray-900 dark:bg-[#2dd4bf] text-white font-semibold py-2 px-6 rounded-xl hover:bg-gray-800 dark:hover:bg-[#14b8a6] transition-colors"
          >
            Share Post
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Popular Channels</h3>
      </div>

      <div className="space-y-6">
        {posts.map((post, index) => (
          <PostCard key={index} post={post} />
        ))}
      </div>
    </div>
  );
};

export default MainContent;
