import React from "react";

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
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
      Vessels
    </h1>
    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <button
        onClick={onAdd}
        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 font-medium py-2 px-4 rounded-xl shadow transition"
      >
        Add Vessel
      </button>
      {hasSelected && (
        <button
          onClick={onDeleteSelected}
          className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 font-medium py-2 px-4 rounded-xl shadow transition"
        >
          Delete Selected
        </button>
      )}
    </div>
  </div>
);

export default VesselsHeader;
