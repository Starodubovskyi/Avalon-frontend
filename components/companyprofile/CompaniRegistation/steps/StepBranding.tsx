"use client";

import { Dispatch, SetStateAction } from "react";
import { chip, labelBase } from "../ui/classes";

type Props = {
  logo: File | null;
  setLogo: Dispatch<SetStateAction<File | null>>;
  banner: File | null;
  setBanner: Dispatch<SetStateAction<File | null>>;
  pin: File | null;
  setPin: Dispatch<SetStateAction<File | null>>;
  formData: { logoUrl?: string; bannerUrl?: string; pinUrl?: string };
};

export default function StepBranding({
  logo,
  setLogo,
  banner,
  setBanner,
  pin,
  setPin,
  formData,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="border-2 border-dashed rounded-xl p-4 dark:border-neutral-700/80">
        <div className="flex items-center justify-between">
          <span className={labelBase}>Company Logo</span>
          <span className={chip}>Square</span>
        </div>
        <div className="mt-3">
          <input
            id="logoUpload"
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
          />
          <label
            htmlFor="logoUpload"
            className="text-blue-600 hover:underline cursor-pointer text-sm dark:text-blue-400"
          >
            Click to upload or drag & drop
          </label>
          <div className="text-[11px] text-gray-500 dark:text-neutral-400">
            JPG/PNG, min 300×250, max 512kb
          </div>
          <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700/80 bg-white/40 dark:bg-neutral-900/40">
            {logo ? (
              <img
                src={URL.createObjectURL(logo)}
                className="w-full h-40 object-contain"
                alt="Logo preview"
              />
            ) : formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                className="w-full h-40 object-contain"
                alt="Logo"
              />
            ) : (
              <div className="h-40 grid place-items-center text-xs text-gray-500">
                No image
              </div>
            )}
          </div>
          {logo && (
            <button
              type="button"
              onClick={() => setLogo(null)}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Remove selected
            </button>
          )}
        </div>
      </div>

      <div className="border-2 border-dashed rounded-xl p-4 dark:border-neutral-700/80">
        <div className="flex items-center justify-between">
          <span className={labelBase}>Company Banner</span>
          <span className={chip}>Wide</span>
        </div>
        <div className="mt-3">
          <input
            id="bannerUpload"
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => setBanner(e.target.files?.[0] || null)}
          />
          <label
            htmlFor="bannerUpload"
            className="text-blue-600 hover:underline cursor-pointer text-sm dark:text-blue-400"
          >
            Click to upload or drag & drop
          </label>
          <div className="text-[11px] text-gray-500 dark:text-neutral-400">
            JPG/PNG, min 234×60, max 512kb
          </div>
          <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700/80 bg-white/40 dark:bg-neutral-900/40">
            {banner ? (
              <img
                src={URL.createObjectURL(banner)}
                className="w-full h-40 object-contain"
                alt="Banner preview"
              />
            ) : formData.bannerUrl ? (
              <img
                src={formData.bannerUrl}
                className="w-full h-40 object-contain"
                alt="Banner"
              />
            ) : (
              <div className="h-40 grid place-items-center text-xs text-gray-500">
                No image
              </div>
            )}
          </div>
          {banner && (
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Remove selected
            </button>
          )}
        </div>
      </div>

      <div className="border-2 border-dashed rounded-xl p-4 dark:border-neutral-700/80">
        <div className="flex items-center justify-between">
          <span className={labelBase}>Company Pin</span>
          <span className={chip}>Small</span>
        </div>
        <div className="mt-3">
          <input
            id="pinUpload"
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => setPin(e.target.files?.[0] || null)}
          />
          <label
            htmlFor="pinUpload"
            className="text-blue-600 hover:underline cursor-pointer text-sm dark:text-blue-400"
          >
            Click to upload or drag & drop
          </label>
          <div className="text-[11px] text-gray-500 dark:text-neutral-400">
            JPG/PNG, min 42×42, max 512kb
          </div>
          <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700/80 bg-white/40 dark:bg-neutral-900/40">
            {pin ? (
              <img
                src={URL.createObjectURL(pin)}
                className="w-full h-40 object-contain"
                alt="Pin preview"
              />
            ) : formData.pinUrl ? (
              <img
                src={formData.pinUrl}
                className="w-full h-40 object-contain"
                alt="Pin"
              />
            ) : (
              <div className="h-40 grid place-items-center text-xs text-gray-500">
                No image
              </div>
            )}
          </div>
          {pin && (
            <button
              type="button"
              onClick={() => setPin(null)}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Remove selected
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
