"use client";

import { useEffect, useState } from "react";
import CompanyRegistrationForm from "./CompaniRegistation/form/CompanyRegistrationForm";
import CompanyCard from "./CompanyCard";
import { Company } from "@/components/types/company.types";
import clsx from "clsx";

// Градиент
const GRADIENT_BG = "bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500";

export default function CompanyProfile() {
  const [company, setCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("company");
    if (saved) {
      try {
        setCompany(JSON.parse(saved));
      } catch {}
    }
    setHydrated(true);
  }, []);

  const handleCompanyCreated = (data: Company) => {
    setCompany(data);
    localStorage.setItem("company", JSON.stringify(data));
    setShowForm(false);
    setEditMode(false);
  };

  const handleUpdateCompany = (next: Company) => {
    setCompany(next);
    localStorage.setItem("company", JSON.stringify(next));
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete your company profile?")) {
      localStorage.removeItem("company");
      setCompany(null);
      setShowForm(false);
      setEditMode(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-48 rounded-[2rem] bg-gray-200 dark:bg-neutral-800" />
          <div className="h-6 w-1/3 rounded-full bg-gray-200 dark:bg-neutral-800" />
          <div className="h-24 rounded-[2rem] bg-gray-200 dark:bg-neutral-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[50dvh] flex flex-col">
      {!company && !showForm && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div
            className="max-w-lg w-full text-center space-y-8 p-10 rounded-[2.5rem]
                 bg-white/80 shadow-2xl
                 dark:bg-[#0d1117]/80 backdrop-blur-xl border border-gray-100 dark:border-white/5
                 mt-[-70px] animate-fade-up"
          >
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              You have no company yet
            </h2>

            <p className="text-gray-600 dark:text-neutral-400 text-lg leading-relaxed">
              Create your business profile to appear in the directory and on the
              map.
            </p>

            <div className="pt-4 border-t border-gray-200 dark:border-white/10" />

            <button
              onClick={() => setShowForm(true)}
              className={clsx(
                "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 transition-all text-lg",
                GRADIENT_BG
              )}
            >
              Create Business Account
            </button>
          </div>
        </div>
      )}

      {company && !showForm && !editMode && (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8">
          <CompanyCard
            company={company}
            canManage={true}
            onUpdateCompany={handleUpdateCompany}
          />
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setEditMode(true)}
              className="px-8 py-3 rounded-full bg-gray-900 text-white dark:bg-white dark:text-black font-bold shadow-lg hover:opacity-90 transition active:scale-95"
            >
              Edit Profile
            </button>
            <button
              onClick={handleDelete}
              className="px-8 py-3 rounded-full border-2 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {(showForm || editMode) && (
        <CompanyRegistrationForm
          onSubmit={handleCompanyCreated}
          initialData={editMode ? company! : undefined}
        />
      )}
    </div>
  );
}
