"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

interface VesselsModalProps {
  onClose: () => void;
  onSubmit: (vessel: any) => void;
  initialData?: any;
}

type FormShape = {
  id: string;
  name: string;
  imo: string;
  vesselType: string;
  destinationPort: string;
  reportedETA: string;
  reportedDestination: string;
  currentPort: string;
  country: string;
  photoUrl: string; // dataURL или URL
};

const REQUIRED_FIELDS: (keyof FormShape)[] = [
  "name",
  "imo",
  "vesselType",
  "destinationPort",
  "reportedETA",
  "currentPort",
];

const VESSEL_TYPES = [
  "Cargo",
  "Container Ship",
  "Bulk Carrier",
  "Tanker",
  "LNG Carrier",
  "Ro-Ro",
  "Passenger / Cruise",
  "Ferry",
  "Fishing",
  "Offshore",
  "Tug",
  "Research",
  "Sailing",
  "High-Speed Craft",
];

const COUNTRY_LIST: { code: string; name: string }[] = Object.entries(
  countries.getNames("en")
)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const VesselsModal: React.FC<VesselsModalProps> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormShape>({
    id: "",
    name: "",
    imo: "",
    vesselType: "",
    destinationPort: "",
    reportedETA: "",
    reportedDestination: "",
    currentPort: "",
    country: "",
    photoUrl: "",
  });

  // фикс: применять initialData только один раз при открытии
  const initializedRef = useRef(false);

  const [touched, setTouched] = useState<Record<keyof FormShape, boolean>>({
    id: false,
    name: false,
    imo: false,
    vesselType: false,
    destinationPort: false,
    reportedETA: false,
    reportedDestination: false,
    currentPort: false,
    country: false,
    photoUrl: false,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialData && !initializedRef.current) {
      setFormData((p) => ({ ...p, ...initialData }));
      initializedRef.current = true;
    }
  }, [initialData]);

  const markTouched = (name: keyof FormShape) =>
    setTouched((t) => ({ ...t, [name]: true }));

  const onChange =
    (name: keyof FormShape) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((p) => ({ ...p, [name]: value }));
    };

  const isFieldInvalid = (name: keyof FormShape) =>
    REQUIRED_FIELDS.includes(name) &&
    touched[name] &&
    !String(formData[name]).trim();

  const isValid = useMemo(
    () =>
      REQUIRED_FIELDS.every((k) => String(formData[k] ?? "").trim().length > 0),
    [formData]
  );

  const handleSubmit = () => {
    if (!isValid) return;
    const payload = { ...formData };
    if (!payload.id) payload.id = Date.now().toString();
    onSubmit(payload);
    onClose();
  };

  const onPickFile = () => fileInputRef.current?.click();

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setFormData((p) => ({ ...p, photoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => setFormData((p) => ({ ...p, photoUrl: "" }));

  const Field = ({
    name,
    label,
    placeholder,
    type = "text",
  }: {
    name: keyof FormShape;
    label: string;
    placeholder?: string;
    type?: React.HTMLInputTypeAttribute;
  }) => (
    <div className="space-y-1">
      <label className="text-xs text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={String(formData[name] ?? "")}
        onChange={onChange(name)}
        onBlur={() => markTouched(name)}
        placeholder={placeholder || label}
        className={[
          "w-full p-2 rounded-xl text-sm",
          "border bg-white/70 dark:bg-black/30",
          "border-gray-300 dark:border-white/15",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          isFieldInvalid(name) ? "border-red-500 focus:ring-red-500" : "",
        ].join(" ")}
      />
      {isFieldInvalid(name) ? (
        <p className="text-xs text-red-500">This field is required.</p>
      ) : null}
    </div>
  );

  const FieldSelect = ({
    name,
    label,
    options,
    placeholder,
  }: {
    name: keyof FormShape;
    label: string;
    options: { value: string; label: string }[];
    placeholder?: string;
  }) => (
    <div className="space-y-1">
      <label className="text-xs text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <select
        value={String(formData[name] ?? "")}
        onChange={(e) => setFormData((p) => ({ ...p, [name]: e.target.value }))}
        onBlur={() => markTouched(name)}
        className={[
          "w-full p-2 rounded-xl text-sm",
          "border bg-white/70 dark:bg-black/30",
          "border-gray-300 dark:border-white/15",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          isFieldInvalid(name) ? "border-red-500 focus:ring-red-500" : "",
        ].join(" ")}
      >
        <option value="">{placeholder || "Select..."}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {isFieldInvalid(name) ? (
        <p className="text-xs text-red-500">This field is required.</p>
      ) : null}
    </div>
  );

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/50 backdrop-blur-sm transition-opacity",
        mounted ? "opacity-100" : "opacity-0",
      ].join(" ")}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={[
          "relative w-full sm:max-w-2xl",
          "rounded-2xl shadow-2xl overflow-hidden",
          "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl",
          "transform transition-all duration-300",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95",
          "max-h-[90vh] flex flex-col",
        ].join(" ")}
      >
        {/* drag handle */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />

        {/* header */}
        <div className="sticky top-0 z-10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            {initialData ? "Edit Vessel" : "Add Vessel"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* content */}
        <div className="px-5 py-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field name="name" label="Name" />
            <Field name="imo" label="IMO" />
            <FieldSelect
              name="vesselType"
              label="Vessel Type"
              placeholder="Select type"
              options={VESSEL_TYPES.map((t) => ({ value: t, label: t }))}
            />
            <Field name="destinationPort" label="Destination Port" />
            <Field name="reportedETA" label="Reported ETA" />
            <Field name="reportedDestination" label="Reported Destination" />
            <Field name="currentPort" label="Current Port" />

            <FieldSelect
              name="country"
              label="Country"
              placeholder="Select country"
              options={COUNTRY_LIST.map((c) => ({
                value: c.name,
                label: c.name,
              }))}
            />

            {/* Фото: загрузка + URL (URL опционально, загрузка приоритетна) */}
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Photo
              </label>

              {formData.photoUrl ? (
                <div className="flex items-center gap-3">
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-28 h-28 rounded-xl object-cover ring-1 ring-black/10"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={onPickFile}
                      className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-sm hover:bg-gray-200 dark:hover:bg-white/20"
                    >
                      Replace
                    </button>
                    <button
                      onClick={clearPhoto}
                      className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={onPickFile}
                    className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/10 text-sm hover:bg-gray-200 dark:hover:bg-white/20"
                  >
                    Upload photo
                  </button>
                  <input
                    type="text"
                    value={formData.photoUrl}
                    onChange={onChange("photoUrl")}
                    placeholder="Photo URL (optional)"
                    className="flex-1 p-2 rounded-xl text-sm border border-gray-300 dark:border-white/15 dark:bg-black/30 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="sticky bottom-0 z-10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-t border-gray-200 dark:border-gray-700 px-5 py-4 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20 active:scale-[0.98] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={[
              "w-full sm:w-auto px-4 py-2 rounded-xl text-white active:scale-[0.98] transition",
              isValid
                ? "bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20"
                : "bg-gray-400 cursor-not-allowed",
            ].join(" ")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default VesselsModal;
