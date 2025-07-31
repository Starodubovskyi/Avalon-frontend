"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsFillLightningFill } from "react-icons/bs";
import { FiFileText } from "react-icons/fi";
import { FaTags } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";

import ActivityList from "./activityList";
import PagesContent from "./pagesContent";
import TagsContent from "./tagsContent";
import StatsContent from "./statsContent";

const tabs = [
  { icon: <BsFillLightningFill />, label: "Activities" },
  { icon: <FiFileText />, label: "Pages" },
  { icon: <FaTags />, label: "Tags" },
  { icon: <IoStatsChart />, label: "Stats" },
];

export const ActivityTabs = () => {
  const [activeTab, setActiveTab] = useState("Activities");

  return (
    <div className="bg-white rounded-xl shadow p-4 flex-1">
      {/* Tabs with animation */}
      <div className="relative flex border-b mb-4 space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`relative pb-2 text-sm flex items-center space-x-2 transition-colors duration-200 ${
              activeTab === tab.label
                ? "text-blue-600 font-medium"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.label && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        <AnimatePresence mode="wait">
          {activeTab === "Activities" && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ActivityList activeTab={activeTab} />
            </motion.div>
          )}

          {activeTab === "Pages" && (
            <motion.div
              key="pages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PagesContent />
            </motion.div>
          )}

          {activeTab === "Tags" && (
            <motion.div
              key="tags"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TagsContent />
            </motion.div>
          )}

          {activeTab === "Stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StatsContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
