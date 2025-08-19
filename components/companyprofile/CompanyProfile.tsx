"use client";

import { useEffect, useState } from "react";
import CompanyRegistrationForm from "./CompaniRegistation/CompanyRegistrationForm";
import CompanyCard from "./CompanyCard";
import { Company } from "@/components/types/company.types";

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
          <div className="h-48 rounded-2xl bg-gray-200 dark:bg-neutral-800" />
          <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-neutral-800" />
          <div className="h-24 rounded-2xl bg-gray-200 dark:bg-neutral-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[50dvh] flex flex-col">
      {!company && !showForm && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div
            className="max-w-lg w-full text-center space-y-6 p-8 rounded-3xl
                 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                 dark:bg-gradient-to-b dark:from-neutral-900 dark:to-neutral-800 
                 dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)]
                 mt-[-70px] animate-fade-up"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              You have no company yet
            </h2>

            <p className="text-gray-600 dark:text-neutral-300">
              Create your business profile to appear in the directory and on the
              map.
            </p>

            <div className="pt-2 border-t border-gray-200 dark:border-white/10" />

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 
                   rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 
                   text-white font-semibold shadow-lg 
                   hover:opacity-90 active:scale-[.98] transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Business Account
            </button>
          </div>

          <style jsx>{`
            .animate-fade-up {
              animation: fadeUp 500ms ease-out both;
            }
            @keyframes fadeUp {
              from {
                opacity: 0;
                transform: translateY(12px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .animate-fade-up {
                animation: none;
              }
            }
          `}</style>
        </div>
      )}

      {company && !showForm && !editMode && (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <CompanyCard company={company} />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setEditMode(true)}
              className="px-5 py-2 rounded-xl bg-neutral-900 text-white border border-neutral-700/80 hover:bg-neutral-800 transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2 rounded-xl border border-red-500/60 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 transition"
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
