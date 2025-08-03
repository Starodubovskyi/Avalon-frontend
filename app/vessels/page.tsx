"use client";

import React from 'react';
import Sidebar from '../../components/Sidebar';
import VesselsPage from '../../components/vessels/VesselsPage';

const Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex">
      <Sidebar />
      <VesselsPage />
    </div>
  );
};

export default Page;