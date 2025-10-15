"use client";

import { Dispatch, SetStateAction } from "react";
import { inputBase, labelBase } from "../ui/classes";

type Props = {
  formData: {
    tagline?: string;
    description?: string;
  };
  errors: Record<string, string>;
  setFormData: Dispatch<SetStateAction<any>>;
};

export default function StepAbout({ formData, errors, setFormData }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className={labelBase}>Tagline</label>
        <input
          className={inputBase}
          value={formData.tagline ?? ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, tagline: e.target.value }))
          }
          placeholder="Short company tagline"
        />
      </div>

      <div>
        <label className={labelBase}>Company Description *</label>
        <div className="relative">
          <textarea
            className={`${inputBase} h-48 resize-none`}
            value={formData.description ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({ ...p, description: e.target.value }))
            }
            placeholder="Tell about your services, fleet, certifications (200–500 chars recommended)"
          />
          <div className="absolute bottom-2 right-3 text-[11px] text-gray-500 dark:text-neutral-400">
            {formData.description?.length || 0} / 500
          </div>
        </div>
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      <label className="flex items-start gap-2 text-[13px] text-gray-700 dark:text-neutral-300">
        <input type="checkbox" className="mt-0.5" required />
        <span>
          I am authorised to create an account for the above company. My
          registered email address matches the official domain name of the
          registered company.
        </span>
      </label>
    </div>
  );
}
