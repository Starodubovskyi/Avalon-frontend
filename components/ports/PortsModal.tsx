"use client";

import React, { useEffect, useMemo, useRef, useState, useId } from "react";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
countries.registerLocale(enLocale);

export interface PortFormData {
  id?: string;
  port?: string;
  unlocode?: string;
  country?: string;
  countryFlag?: string;
  timezone?: string;
  photoUrl?: string;
}

export default function PortsModal({
  initialData,
  onClose,
  onSubmit,
}: {
  initialData?: Partial<PortFormData>;
  onClose: () => void;
  onSubmit: (data: PortFormData) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<PortFormData>({
    id: "",
    port: "",
    unlocode: "",
    country: "",
    countryFlag: "",
    timezone: "",
    photoUrl: "",
    ...(initialData || {}),
  });

  const touchedRef = useRef<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement | null>(null);
  const initedRef = useRef(false);
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
    if (initialData && !initedRef.current) {
      setForm((p) => ({ ...p, ...(initialData || {}) }));
      initedRef.current = true;
    }
  }, [initialData]);

  useEffect(() => {
    if (mounted) firstInputRef.current?.focus();
  }, [mounted]);

  const stopAll = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const COUNTRIES = useMemo(
    () =>
      Object.entries(countries.getNames("en"))
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const toAlpha2 = (val?: string) => {
    if (!val) return "";
    const s = val.trim();
    if (s.length === 2) return s.toLowerCase();
    const c = countries.getAlpha2Code(s, "en");
    return (c || "").toLowerCase();
  };
  const flagUrl = (alpha2: string) =>
    alpha2
      ? `https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/${alpha2}.svg`
      : "";

  const setCountry = (countryNameOrCode: string) => {
    const a2 = toAlpha2(countryNameOrCode);
    setForm((p) => ({
      ...p,
      country:
        countryNameOrCode.length === 2
          ? countries.getName(countryNameOrCode.toUpperCase(), "en") ||
            countryNameOrCode
          : countryNameOrCode,
      countryFlag: flagUrl(a2),
    }));
  };

  const markTouched = (k: keyof PortFormData) => {
    touchedRef.current[k as string] = true;
  };

  const requiredInvalid = (k: keyof PortFormData) =>
    ["port", "unlocode", "country"].includes(String(k)) &&
    touchedRef.current[k as string] &&
    !String((form as any)[k] || "").trim();

  const isValid = ["port", "unlocode", "country"].every(
    (k) => String((form as any)[k] || "").trim().length > 0
  );

  const handleSave = () => {
    if (!isValid) return;
    const payload: PortFormData = {
      ...form,
      id: form.id || String(Date.now()),
      countryFlag: form.countryFlag || flagUrl(toAlpha2(form.country)),
    };
    onSubmit(payload);
    onClose();
  };

  const pickFile = () => fileRef.current?.click();
  const onFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const fr = new FileReader();
    fr.onload = () =>
      setForm((p) => ({ ...p, photoUrl: String(fr.result || "") }));
    fr.readAsDataURL(file);
  };

  const Field = ({
    name,
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    inputRef,
    autoFocus,
  }: {
    name: keyof PortFormData;
    label: string;
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    inputRef?: React.RefObject<HTMLInputElement>;
    autoFocus?: boolean;
  }) => {
    const id = useId();
    return (
      <div
        className="space-y-1.5"
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
          value={value}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
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
            requiredInvalid(name) ? "border-red-500 focus:ring-red-500" : "",
          ].join(" ")}
        />
        {requiredInvalid(name) && (
          <p className="text-xs text-red-500 font-medium">
            This field is required.
          </p>
        )}
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
      role="dialog"
      aria-modal="true"
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {initialData ? "Edit Port" : "Add Port"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              name="port"
              label="Port Name"
              value={form.port || ""}
              onChange={(v) => setForm((p) => ({ ...p, port: v }))}
              inputRef={firstInputRef}
              autoFocus
            />
            <Field
              name="unlocode"
              label="UNLOCODE"
              value={form.unlocode || ""}
              onChange={(v) =>
                setForm((p) => ({ ...p, unlocode: v.toUpperCase() }))
              }
            />

            <div
              className="space-y-1.5"
              onKeyDownCapture={stopAll}
              onKeyUpCapture={stopAll}
              onKeyPressCapture={stopAll}
            >
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Country
              </label>
              <select
                value={form.country || ""}
                onChange={(e) => setCountry(e.target.value)}
                onBlur={() => markTouched("country")}
                onKeyDown={stopAll}
                onKeyUp={stopAll}
                onKeyPress={stopAll}
                className={[
                  "w-full p-2.5 rounded-xl text-sm transition-all",
                  "border bg-white/70 dark:bg-black/30",
                  "border-gray-300 dark:border-white/15",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
                  requiredInvalid("country")
                    ? "border-red-500 focus:ring-red-500"
                    : "",
                ].join(" ")}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {requiredInvalid("country") && (
                <p className="text-xs text-red-500 font-medium">
                  This field is required.
                </p>
              )}
              {form.countryFlag ? (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <img
                    src={form.countryFlag}
                    alt={form.country || ""}
                    className="w-6 h-4.5 rounded-sm ring-1 ring-black/10 shadow-sm"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                    {form.country}
                  </span>
                </div>
              ) : null}
            </div>

            <Field
              name="timezone"
              label="Timezone"
              placeholder="e.g. UTC+2 / Europe/Bucharest"
              value={form.timezone || ""}
              onChange={(v) => setForm((p) => ({ ...p, timezone: v }))}
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
              {form.photoUrl ? (
                <div className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                  <img
                    src={form.photoUrl}
                    alt="Preview"
                    className="w-24 h-24 rounded-xl object-cover ring-1 ring-black/10 shadow-sm"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={pickFile}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-sm hover:bg-gray-50 dark:hover:bg-white/20 transition shadow-sm"
                    >
                      Replace
                    </button>
                    <button
                      onClick={() => setForm((p) => ({ ...p, photoUrl: "" }))}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm hover:bg-red-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={pickFile}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-sm hover:bg-gray-200 dark:hover:bg-white/20 transition font-medium text-gray-700 dark:text-gray-200"
                  >
                    Upload photo
                  </button>
                  <input
                    type="text"
                    placeholder="or paste Photo URL"
                    value={form.photoUrl || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, photoUrl: e.target.value }))
                    }
                    onKeyDown={stopAll}
                    onKeyUp={stopAll}
                    onKeyPress={stopAll}
                    className="flex-1 p-2.5 rounded-xl text-sm border border-gray-300 dark:border-white/15 dark:bg-black/30 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] || null)}
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
            onClick={handleSave}
            disabled={!isValid}
            className={[
              "w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-medium active:scale-[0.98] transition-all shadow-lg",
              isValid
                ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 hover:from-blue-600 hover:via-indigo-600 hover:to-sky-600 shadow-indigo-500/25"
                : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none",
            ].join(" ")}
          >
            Save Port
          </button>
        </div>
      </div>
    </div>
  );
}
