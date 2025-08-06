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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
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
            className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:text-white"
          />
        ))}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VesselsModal;
