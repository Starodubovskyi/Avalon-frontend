"use client";

import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "No companies found",
  subtitle = "Try adjusting your filters or search query.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4">
        <SearchX className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
        {subtitle}
      </p>
    </div>
  );
}
