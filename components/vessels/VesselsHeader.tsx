import React from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react"; // Optional icons for better UI

interface VesselsHeaderProps {
  onAdd: () => void;
  onDeleteSelected: () => void;
  hasSelected: boolean;
}

const VesselsHeader: React.FC<VesselsHeaderProps> = ({
  onAdd,
  onDeleteSelected,
  hasSelected,
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <div className="flex items-center gap-3">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        Vessels
      </h1>
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5 animate-pulse" />
        Live list
      </span>
    </div>

    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
      <button
        onClick={onAdd}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 text-white font-medium py-2.5 px-5 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all"
      >
        <span>Add Vessel</span>
      </button>

      {hasSelected && (
        <button
          onClick={onDeleteSelected}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
        >
          Delete Selected
        </button>
      )}
    </div>
  </div>
);

export default VesselsHeader;
