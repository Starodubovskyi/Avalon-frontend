"use client";

import React, { useState, useEffect } from "react";

interface VesselsModalProps {
  onClose: () => void;
  onSubmit: (vessel: any) => void;
  initialData?: any;
}

const VesselsModal: React.FC<VesselsModalProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    destinationPort: "",
    reportedETA: "",
    vesselType: "",
    photoUrl: "",
    currentPort: "",
    reportedDestination: "",
    imo: "",
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    const payload = { ...formData };
    if (!payload.id) payload.id = Date.now().toString();
    onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 shadow rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-200">
            {initialData ? "Edit Vessel" : "Add Vessel"}
          </h2>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {[
          "name",
          "imo",
          "vesselType",
          "destinationPort",
          "reportedETA",
          "reportedDestination",
          "currentPort",
          "photoUrl",
        ].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={(formData as any)[field]}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm border-gray-300 dark:border-white/20 dark:bg-black/30 dark:text-white"
          />
        ))}

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VesselsModal;
