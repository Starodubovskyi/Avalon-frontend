"use client";

import { Dispatch, SetStateAction } from "react";
import { inputBase, labelBase } from "../ui/classes";

type Props = {
  formData: {
    email?: string;
    website?: string;
    telephone?: string;
    fax?: string;
    poBox?: string;
  };
  errors: Record<string, string>;
  setFormData: Dispatch<SetStateAction<any>>;
};

export default function StepContacts({ formData, errors, setFormData }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className={labelBase}>Company Email *</label>
        <input
          className={`${inputBase} ${errors.email ? "border-red-500" : ""}`}
          value={formData.email ?? ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, email: e.target.value }))
          }
          placeholder="name@company.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email}</p>
        )}
      </div>
      <div>
        <label className={labelBase}>Website *</label>
        <input
          className={`${inputBase} ${errors.website ? "border-red-500" : ""}`}
          value={formData.website ?? ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, website: e.target.value }))
          }
          placeholder="https://company.com"
        />
        {errors.website && (
          <p className="mt-1 text-xs text-red-500">{errors.website}</p>
        )}
      </div>
      <div>
        <label className={labelBase}>Telephone</label>
        <input
          className={inputBase}
          value={formData.telephone ?? ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, telephone: e.target.value }))
          }
          placeholder="+40..."
        />
      </div>
      <div>
        <label className={labelBase}>Fax</label>
        <input
          className={inputBase}
          value={formData.fax ?? ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, fax: e.target.value }))
          }
          placeholder="+40..."
        />
      </div>
      <div>
        <label className={labelBase}>P.O. Box</label>
        <input
          className={inputBase}
          value={formData.poBox ?? ""}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, poBox: e.target.value }))
          }
          placeholder="P.O. Box"
        />
      </div>
    </div>
  );
}
