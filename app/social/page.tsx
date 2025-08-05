"use client";

import React from 'react';
import SocialPage from '@/components/social/SocialPage';
import MainLayout from '@/components/layout/MainLayout';

const Page: React.FC = () => {
  return (
    <MainLayout>
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex">
      <SocialPage />
    </div>
    </MainLayout>
  );
};

export default Page;
