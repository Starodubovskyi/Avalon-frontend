"use client";

import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

interface VesselsModalProps {
  onClose: () => void;
  onSubmit: (vessel: any) => void;
  initialData?: any;
}

// ... (Types and constants remain unchanged) ...
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
  photoUrl: string;
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
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (initialData && !initializedRef.current) {
      setFormData((p) => ({ ...p, ...initialData }));
      initializedRef.current = true;
    }
  }, [initialData]);

  useEffect(() => {
    if (mounted) firstInputRef.current?.focus();
  }, [mounted]);

  const stopAll = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

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
    autoFocus,
    inputRef,
  }: {
    name: keyof FormShape;
    label: string;
    placeholder?: string;
    type?: React.HTMLInputTypeAttribute;
    autoFocus?: boolean;
    inputRef?: React.RefObject<HTMLInputElement>;
  }) => {
    const id = useId();
    return (
      <div
        className="space-y-1"
        onKeyDownCapture={stopAll}
        onKeyUpCapture={stopAll}
        onKeyPressCapture={stopAll}
      >
        <label
          htmlFor={id}
          className="text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {label}
        </label>
        <input
          id={id}
          ref={inputRef}
          autoFocus={autoFocus}
          type={type}
          autoComplete="off"
          value={String(formData[name] ?? "")}
          onChange={onChange(name)}
          onBlur={() => markTouched(name)}
          onKeyDown={stopAll}
          onKeyUp={stopAll}
          onKeyPress={stopAll}
          placeholder={placeholder || label}
          className={[
            "w-full p-2.5 rounded-xl text-sm transition-all",
            "border bg-white/70 dark:bg-black/30",
            "border-gray-300 dark:border-white/15",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            isFieldInvalid(name) ? "border-red-500 focus:ring-red-500" : "",
          ].join(" ")}
        />
        {isFieldInvalid(name) ? (
          <p className="text-xs text-red-500">This field is required.</p>
        ) : null}
      </div>
    );
  };

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
  }) => {
    const id = useId();
    return (
      <div
        className="space-y-1"
        onKeyDownCapture={stopAll}
        onKeyUpCapture={stopAll}
        onKeyPressCapture={stopAll}
      >
        <label
          htmlFor={id}
          className="text-xs font-medium text-gray-500 dark:text-gray-400"
        >
          {label}
        </label>
        <select
          id={id}
          value={String(formData[name] ?? "")}
          onChange={(e) =>
            setFormData((p) => ({ ...p, [name]: e.target.value }))
          }
          onBlur={() => markTouched(name)}
          onKeyDown={stopAll}
          onKeyUp={stopAll}
          onKeyPress={stopAll}
          className={[
            "w-full p-2.5 rounded-xl text-sm transition-all",
            "border bg-white/70 dark:bg-black/30",
            "border-gray-300 dark:border-white/15",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
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
  };

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/50 backdrop-blur-sm transition-opacity",
        mounted ? "opacity-100" : "opacity-0",
      ].join(" ")}
      aria-modal="true"
      role="dialog"
      onKeyDownCapture={stopAll}
      onKeyUpCapture={stopAll}
      onKeyPressCapture={stopAll}
      onMouseDownCapture={stopAll}
      onTouchStartCapture={stopAll}
    >
      <div
        className={[
          "relative w-full sm:max-w-2xl",
          "rounded-2xl shadow-2xl overflow-hidden",
          "bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl",
          "transform transition-all duration-300",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95",
          "max-h-[90vh] flex flex-col",
        ].join(" ")}
        onKeyDownCapture={stopAll}
        onKeyUpCapture={stopAll}
        onKeyPressCapture={stopAll}
        onMouseDownCapture={stopAll}
        onTouchStartCapture={stopAll}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700" />

        <div className="sticky top-0 z-10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {initialData ? "Edit Vessel" : "Add Vessel"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field
              name="name"
              label="Name"
              inputRef={firstInputRef}
              autoFocus
            />
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

            <div
              className="sm:col-span-2 space-y-2 pt-2"
              onKeyDownCapture={stopAll}
              onKeyUpCapture={stopAll}
              onKeyPressCapture={stopAll}
            >
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Photo
              </label>

              {formData.photoUrl ? (
                <div className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                  <img
                    src={formData.photoUrl}
                    alt="Preview"
                    className="w-24 h-24 rounded-xl object-cover ring-1 ring-black/10 shadow-sm"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={onPickFile}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-sm hover:bg-gray-50 dark:hover:bg-white/20 transition shadow-sm"
                    >
                      Replace
                    </button>
                    <button
                      onClick={clearPhoto}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm hover:bg-red-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={onPickFile}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition font-medium"
                  >
                    Upload photo
                  </button>
                  <input
                    type="text"
                    value={formData.photoUrl}
                    onChange={onChange("photoUrl")}
                    onBlur={() => markTouched("photoUrl")}
                    onKeyDown={stopAll}
                    onKeyUp={stopAll}
                    onKeyPress={stopAll}
                    placeholder="or paste Photo URL"
                    className="flex-1 p-2.5 rounded-xl text-sm border border-gray-300 dark:border-white/15 dark:bg-black/30 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        <div className="sticky bottom-0 z-10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur border-t border-gray-200 dark:border-gray-700 px-6 py-5 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20 active:scale-[0.98] transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={[
              "w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-medium active:scale-[0.98] transition-all shadow-lg",
              isValid
                ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 shadow-indigo-500/25"
                : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none",
            ].join(" ")}
          >
            Save Vessel
          </button>
        </div>
      </div>
    </div>
  );
};

export default VesselsModal;
