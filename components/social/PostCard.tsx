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
    <div className="bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <img src={post.user.photo} alt={post.user.name} className="w-10 h-10 rounded-full" />
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">{post.user.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{post.user.handle} &bull; {post.user.country}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <span className="text-sm">{post.time}</span>
          <button><MoreVertical size={20} /></button>
        </div>
      </div>
      
      <div>
        <p className="text-gray-900 dark:text-white mb-4">{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post" className="w-full rounded-2xl mb-4" />
        )}
      </div>

      <div className="flex justify-around text-gray-500 dark:text-gray-400 mt-4">
        <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
          <Heart size={20} />
          <span>Like</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-green-500 transition-colors">
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
