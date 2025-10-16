"use client";

import { Dispatch, SetStateAction } from "react";
import { BUSINESS_ACTIVITIES } from "../ui/constants";
import { labelBase, inputBase } from "../ui/classes";

type Props = {
  formData: {
    legalName?: string;
    businessName?: string;
    activity?: string;
    employees?: string;
    founded?: string;
  };
  errors: Record<string, string>;
  setFormData: Dispatch<SetStateAction<any>>;
};

export default function StepCompany({ formData, errors, setFormData }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className={labelBase}>Legal Company Name *</label>
        <input
          className={`${inputBase} ${errors.legalName ? "border-red-500" : ""}`}
          value={formData.legalName ?? ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, legalName: e.target.value }))
          }
          placeholder="Legal Name"
        />
        {errors.legalName && (
          <p className="mt-1 text-xs text-red-500">{errors.legalName}</p>
        )}
      </div>

      <div>
        <label className={labelBase}>Business Name (Trading as) *</label>
        <input
          className={`${inputBase} ${
            errors.businessName ? "border-red-500" : ""
          }`}
          value={formData.businessName ?? ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, businessName: e.target.value }))
          }
          placeholder="Business Name"
        />
        {errors.businessName && (
          <p className="mt-1 text-xs text-red-500">{errors.businessName}</p>
        )}
      </div>

      <div>
        <label className={labelBase}>Main Business Activity *</label>
        <select
          className={`${inputBase} ${errors.activity ? "border-red-500" : ""}`}
          value={formData.activity || ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, activity: e.target.value }))
          }
        >
          <option value="" disabled>
            Select Business Activity
          </option>
          {BUSINESS_ACTIVITIES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {errors.activity && (
          <p className="mt-1 text-xs text-red-500">{errors.activity}</p>
        )}
      </div>

      <div>
        <label className={labelBase}>Number of Employees</label>
        <input
          className={inputBase}
          value={formData.employees ?? ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, employees: e.target.value }))
          }
          placeholder="e.g. 20–50"
        />
      </div>

      <div>
        <label className={labelBase}>Founded (Year)</label>
        <input
          className={inputBase}
          value={formData.founded ?? ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, founded: e.target.value }))
          }
          placeholder="e.g. 2016"
        />
      </div>
    </div>
  );
}
