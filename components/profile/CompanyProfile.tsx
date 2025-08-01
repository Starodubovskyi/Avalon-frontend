"use client";

import { useEffect, useState } from "react";
import CompanyRegistrationForm from "./CompanyRegistrationForm";
import CompanyCard from "./CompanyCard";

type Company = {
  legalName: string;
  businessName: string;
  activity: string;
  founded: string;
  employees: string;
  description: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  email: string;
  telephone?: string;
  fax?: string;
  website: string;
  poBox?: string;
  logoUrl?: string;
  bannerUrl?: string;
  pinUrl?: string;
  lat: number;
  lng: number;
};

export default function CompanyProfile() {
  const [company, setCompany] = useState<Company | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("company");
    if (saved) {
      setCompany(JSON.parse(saved));
    }
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

  if (!company && !showForm) {
    return (
      <div className="text-center mt-12">
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          You have not registered a company profile yet.
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          Create Business Account
        </button>
      </div>
    );
  }

  if (showForm || editMode) {
    return (
      <CompanyRegistrationForm
        onSubmit={handleCompanyCreated}
        initialData={editMode ? company! : undefined}
      />
    );
  }

  return (
    <div className="relative space-y-6">
      <CompanyCard company={company!} />
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => setEditMode(true)}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
