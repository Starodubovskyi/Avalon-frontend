import { useEffect, useState } from "react";
import CompanyRegistrationForm from "./CompaniRegistation/CompanyRegistrationForm";
import CompanyCard from "./CompanyCard";
import { Company } from "@/components/types/company.types";

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

  return (
    <div className="min-h-screen flex items-center justify-center p-0 bg-gray-100 dark:bg-gray-900">
      {/* If no company, show create form */}
      {!company && !showForm && (
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
            You have not registered a company profile yet.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Create Business Account
          </button>
        </div>
      )}

      {/* Show company profile or edit form */}
      {company && !showForm && !editMode && (
        <div className="relative w-full h-full max-w-full">
          <CompanyCard company={company} />
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setEditMode(true)}
              className="px-5 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Show the company registration form or editing mode */}
      {(showForm || editMode) && (
        <CompanyRegistrationForm
          onSubmit={handleCompanyCreated}
          initialData={editMode ? company! : undefined}
        />
      )}
    </div>
  );
}
