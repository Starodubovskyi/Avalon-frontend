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
    <div className="flex items-center gap-3">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        Vessels
      </h1>
      <span className="hidden sm:inline-flex text-[11px] leading-none px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
        Live list
      </span>
    </div>

    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
      <button
        onClick={onAdd}
        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl shadow-sm active:scale-[0.98] transition-all"
      >
        Add Vessel
      </button>
      {hasSelected && (
        <button
          onClick={onDeleteSelected}
          className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl shadow-sm active:scale-[0.98] transition-all"
        >
          Delete Selected
        </button>
      )}
    </div>
  </div>
);

export default VesselsHeader;
