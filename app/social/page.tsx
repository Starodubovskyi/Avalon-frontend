"use client";

import React from 'react';
import Sidebar from '../../components/Sidebar';
import SocialPage from '@/components/social/SocialPage';

const Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex">
      <Sidebar />
      <SocialPage />
    </div>
  );
};

export default Page;
