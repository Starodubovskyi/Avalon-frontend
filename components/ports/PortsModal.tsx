"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PortForm {
  id?: string;
  port: string;
  unlocode: string;
  country: string;
  countryFlag: string;
  photo: string;
  vessels: string;
  departures: string;
  arrivals: string;
  expectedArrivals: string;
  localTime: string;
  anchorage: string;
  areaGlobal: string;
  areaLocal: string;
}

interface PortsModalProps {
  onClose: () => void;
  onSubmit: (port: PortForm) => void;
  initialData?: PortForm;
}

const PortsModal: React.FC<PortsModalProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<PortForm>({
    port: "",
    unlocode: "",
    country: "",
    countryFlag: "",
    photo: "",
    vessels: "",
    departures: "",
    arrivals: "",
    expectedArrivals: "",
    localTime: "",
    anchorage: "",
    areaGlobal: "",
    areaLocal: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        photo: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!formData.port || !formData.unlocode) return;
    if (!formData.id) formData.id = Date.now().toString();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {initialData ? "Edit Port" : "Add Port"}
        </h2>

        {/* Текстовые поля */}
        {[
          "port",
          "unlocode",
          "country",
          "countryFlag",
          "vessels",
          "departures",
          "arrivals",
          "expectedArrivals",
          "localTime",
          "anchorage",
          "areaGlobal",
          "areaLocal",
        ].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={(formData as any)[field]}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded text-sm dark:bg-gray-700 dark:text-white"
          />
        ))}

        {/* Загрузка фото */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">
            Upload Port Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm"
          />
          {formData.photo && (
            <img
              src={formData.photo}
              alt="Preview"
              className="h-40 w-full object-cover rounded mt-2"
            />
          )}
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PortsModal;
