"use client";

import React, { useEffect, useState } from 'react';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightSidebar from './RightSidebar';

interface UserProfile {
  name: string;
  lastName: string;
  profileImage?: string;
}

const SocialPage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser: UserProfile = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
    }
  }, []);

  const userForSidebar = currentUser ? {
    name: `${currentUser.name} ${currentUser.lastName}`,
    handle: '@userHandle', 
    photo: currentUser.profileImage || 'https://placehold.co/64x64/000000/ffffff?text=User',
    followers: '0', 
    follows: '0', 
    posts: '0', 
  } : null;

 
  const userForMainContent = currentUser ? {
    name: `${currentUser.name} ${currentUser.lastName}`,
    handle: '@userHandle',
    country: 'Украина', // Заглушка
    photo: currentUser.profileImage || 'https://placehold.co/40x40/000000/ffffff?text=U',
  } : null;


  if (!userForSidebar || !userForMainContent) {
    return (
      <div className="flex-1 p-8 text-center text-gray-500 dark:text-gray-400">
        Загрузка... или пользователь не найден.
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 flex space-x-6">
      <LeftSidebar user={userForSidebar} />
      <MainContent currentUser={userForMainContent}/>
      <RightSidebar />
    </div>
  );
};

export default SocialPage;
