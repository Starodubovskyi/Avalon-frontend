"use client";

import React from 'react';
import { MoreVertical, Heart, MessageCircle, Share2 } from 'lucide-react';

interface PostCardProps {
  post: {
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
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <img src={post.user.photo} alt={post.user.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full" />
          <div className="leading-tight">
            <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
              {post.user.name}
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
              {post.user.handle} • {post.user.country}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <span className="text-[11px] sm:text-xs">{post.time}</span>
          <button aria-label="More"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Content */}
      <div>
        <p className="text-[15px] sm:text-base leading-relaxed text-gray-900 dark:text-white mb-3 sm:mb-4 break-words">
          {post.content}
        </p>
        {post.image && (
          <img src={post.image} alt="Post" className="w-full rounded-2xl mb-3 sm:mb-4" />
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between sm:justify-around text-gray-500 dark:text-gray-400 mt-3 sm:mt-4">
        <button className="flex items-center gap-2 hover:text-red-500 transition-colors text-sm sm:text-base">
          <Heart size={18} />
          <span>Like</span>
        </button>
        <button className="flex items-center gap-2 hover:text-blue-500 transition-colors text-sm sm:text-base">
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-2 hover:text-green-500 transition-colors text-sm sm:text-base">
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
