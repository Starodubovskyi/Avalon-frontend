import React from "react";
import { ChevronDown } from "lucide-react";

const FilterPanel: React.FC = () => {
  return (
    <div
      className="w-64 p-6 bg-white border border-gray-200 shadow rounded-2xl
      dark:bg-white/5 dark:border-white/10 dark:shadow-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          Report date
        </span>
        <button className="text-gray-500 dark:text-gray-400 p-1">
          <ChevronDown />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
        <input
          type="date"
          className="p-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          value="2024-01-01"
        />
        <input
          type="date"
          className="p-2 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          value="2025-05-31"
        />
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Deal Owner
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>Owner 1</option>
            <option>Owner 2</option>
          </select>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Deal Stage
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>Stage 1</option>
            <option>Stage 2</option>
          </select>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Pipeline
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>Pipeline 1</option>
            <option>Pipeline 2</option>
          </select>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Deal Label
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>Label 1</option>
            <option>Label 2</option>
          </select>
        </div>
      </div>
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-center">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Have questions?
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Dashboard setup guide
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
          Book a demo
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
          Contact support
        </p>
      </div>
    </div>
  );
};

export default FilterPanel;
