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
    if (!formData.id) formData.id = Date.now().toString();
    onSubmit(formData);
    onClose();
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-white/50 dark:bg-black/70
        flex items-center justify-center
      "
    >
      <div
        className="
          bg-white border border-gray-200 shadow rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4
          dark:bg-white/5 dark:border-white/10 dark:shadow-white/10
        "
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-200">
          {initialData ? "Edit Vessel" : "Add Vessel"}
        </h2>
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
            className="w-full p-2 border rounded text-sm border-gray-300 dark:border-white/20 dark:bg-black/50 dark:text-white"
          />
        ))}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VesselsModal;
