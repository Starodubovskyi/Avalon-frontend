"use client";

import React from "react";
import { MoreVertical } from "lucide-react";

interface Props {
  mode?: "desktop" | "mobile";
}

const RightSidebar: React.FC<Props> = ({ mode = "desktop" }) => {
  const peoples = [
    {
      name: "Anthony Lewis",
      country: "United States",
      photo: "https://placehold.co/40x40/5a67d8/ffffff?text=AL",
    },
    {
      name: "Harvey Smith",
      country: "Ukran",
      photo: "https://placehold.co/40x40/38a169/ffffff?text=HS",
    },
    {
      name: "Stephan Perait",
      country: "Ukran",
      photo: "https://placehold.co/40x40/805ad5/ffffff?text=SP",
    },
    {
      name: "Doglos Marihi",
      country: "Kingdom",
      photo: "https://placehold.co/40x40/d53f8c/ffffff?text=DM",
    },
    {
      name: "Brian Villalobos",
      country: "United Kingdom",
      photo: "https://placehold.co/40x40/f6ad55/ffffff?text=BV",
    },
    {
      name: "Linda Ray",
      country: "Argentina",
      photo: "https://placehold.co/40x40/000000/ffffff?text=LR",
    },
  ];

  const savedFeeds = [
    {
      title: "Word Health",
      content: "Retail investor party continues even as",
    },
    { title: "T3 Tech", content: "iPad Air (2020) vs Samsung Galaxy Tab" },
    { title: "Fotoggers", content: "Beyond capital gains tax: Top 50 stock" },
  ];

  const rootClass =
    mode === "desktop"
      ? "hidden lg:block lg:w-1/5 space-y-6"
      : "block w-full space-y-6";

  return (
    <div className={rootClass}>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            Peoples
          </h3>
          <div className="flex space-x-2">
            <button
              type="button"
              className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 text-xs px-3 py-1 rounded-xl"
            >
              General
            </button>
            <button
              type="button"
              className="text-gray-600 dark:text-gray-400 text-xs px-3 py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
            >
              Primary
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {peoples.map((p, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={p.photo}
                  alt={p.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {p.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {p.country}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label={`More options for ${p.name}`}
              >
                <MoreVertical size={20} />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="w-full text-blue-600 dark:text-blue-400 font-medium mt-4 hover:underline"
          >
            View All
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)] dark:bg-white/5 dark:border-white/10 dark:shadow-[0_16px_40px_rgba(255,255,255,0.06)] p-6">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
          Saved Feeds
        </h3>
        <div className="space-y-4">
          {savedFeeds.map((feed, i) => (
            <div
              key={i}
              className="pb-4 border-b border-gray-200 dark:border-white/10 last:border-b-0"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                {feed.title}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {feed.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
