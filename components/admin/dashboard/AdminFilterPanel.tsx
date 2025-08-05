import React from "react";
import { ChevronDown } from "lucide-react";

const AdminFilterPanel: React.FC = () => {
  return (
    <div className="w-full sm:w-64 p-6 bg-white dark:bg-[#1a233b] rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          Data Period
        </span>
        <button className="text-gray-500 dark:text-gray-400 p-1">
          <ChevronDown />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
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
            Event Type
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>Login/Logout</option>
            <option>Data Change</option>
            <option>Error</option>
          </select>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            User
          </span>
          <input
            type="text"
            placeholder="User ID or Email"
            className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Status
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>Active</option>
            <option>Blocked</option>
            <option>Pending Confirmation</option>
          </select>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            System Section
          </span>
          <select className="w-full p-2 mt-1 rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option>All</option>
            <option>User Management</option>
            <option>Settings</option>
            <option>Reports</option>
          </select>
        </div>
      </div>
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl text-center">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Administrative Actions
        </h4>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold mt-2">
          User Management
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
          System Settings
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
          Export Data
        </p>
      </div>
    </div>
  );
};

export default AdminFilterPanel;
