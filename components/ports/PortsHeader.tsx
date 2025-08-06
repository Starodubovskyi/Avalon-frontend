"use client";

import { FaSearch } from "react-icons/fa";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PortsHeaderProps {
  onAdd: () => void;
  onDeleteSelected: () => void;
  hasSelected: boolean;
  search: string;
  setSearch: (value: string) => void;
}

const PortsHeader: React.FC<PortsHeaderProps> = ({
  onAdd,
  onDeleteSelected,
  hasSelected,
  search,
  setSearch,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">
          Ports
        </h1>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search in Port / UNLOCODE"
            className="w-full sm:w-80 pl-10 pr-4 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add Port
        </Button>
        {hasSelected && (
          <Button
            onClick={onDeleteSelected}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Selected
          </Button>
        )}
        <Button className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600">
          <Download className="w-4 h-4 mr-2" />
          Export All Data
        </Button>
      </div>
    </div>
  );
};

export default PortsHeader;
