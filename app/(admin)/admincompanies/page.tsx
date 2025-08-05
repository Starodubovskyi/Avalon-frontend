"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ThemeToggler from "@/components/ThemeToggler";
import CompanyStats from "@/components/admin/companies/CompanyStats";
import CompaniesTable from "@/components/admin/companies/CompaniesTable";
import AddEditCompanyModal from "@/components/admin/companies/AddEditCompanyModal";
import DeleteConfirmationModal from "@/components/admin/companies/DeleteConfirmationModal";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Company {
  name: string;
  category: string;
  country: string;
  city: string;
  logoUrl: string;
}

export interface AdminCompany {
  id: string;
  companyName: string;
  email: string;
  accountURL: string;
  plan: string;
  createdDate: string;
  status: "Active" | "Inactive";
  logoUrl?: string;
}

const companiesData: Company[] = [
  {
    name: "AVS Global Ship Supply",
    category: "Ship Services / Suppliers",
    country: "🇹🇷 Turkey",
    city: "Istanbul",
    logoUrl: "/logos/avs.png",
  },
  {
    name: "ASCA MARITIME FZE",
    category: "Ship Chandlers",
    country: "🇦🇪 UAE",
    city: "Al Hamriyah",
    logoUrl: "/logos/asca.png",
  },
  {
    name: "The Web Factory",
    category: "Software / Technology",
    country: "🇺🇸 USA",
    city: "Dover",
    logoUrl: "",
  },
  {
    name: "Qbecus",
    category: "Software / Technology",
    country: "🇺🇸 USA",
    city: "Boulder",
    logoUrl: "",
  },
];

const initialAdminCompanies: AdminCompany[] = [
  {
    id: "1",
    companyName: "BrightWave Innovations",
    email: "michael@example.com",
    accountURL: "bwi.example.com",
    plan: "Advanced (Monthly)",
    createdDate: "12 Sep 2024",
    status: "Active",
    logoUrl: "/logos/brightwave.png",
  },
  {
    id: "2",
    companyName: "Stellar Dynamics",
    email: "sophie@example.com",
    accountURL: "sd.example.com",
    plan: "Basic (Yearly)",
    createdDate: "24 Oct 2024",
    status: "Active",
    logoUrl: "/logos/stellar.png",
  },
  {
    id: "3",
    companyName: "Quantum Nexus",
    email: "cameron@example.com",
    accountURL: "qn.example.com",
    plan: "Advanced (Monthly)",
    createdDate: "18 Feb 2024",
    status: "Active",
    logoUrl: "/logos/quantum.png",
  },
  {
    id: "4",
    companyName: "EcoVision Enterprises",
    email: "doris@example.com",
    accountURL: "eve.example.com",
    plan: "Advanced (Monthly)",
    createdDate: "17 Oct 2024",
    status: "Active",
    logoUrl: "/logos/ecovision.png",
  },
  {
    id: "5",
    companyName: "Aurora Technologies",
    email: "thomas@example.com",
    accountURL: "at.example.com",
    plan: "Enterprise (Monthly)",
    createdDate: "20 Jul 2024",
    status: "Active",
    logoUrl: "/logos/aurora.png",
  },
  {
    id: "6",
    companyName: "Global Solutions Inc.",
    email: "info@globalsolutions.com",
    accountURL: "gsi.example.com",
    plan: "Basic (Monthly)",
    createdDate: "01 Mar 2024",
    status: "Inactive",
    logoUrl: "/logos/global.png",
  },
  {
    id: "7",
    companyName: "Apex Innovations",
    email: "contact@apexinnovations.com",
    accountURL: "apex.example.com",
    plan: "Advanced (Yearly)",
    createdDate: "05 Jan 2024",
    status: "Active",
    logoUrl: "/logos/apex.png",
  },
  {
    id: "8",
    companyName: "FutureNet Systems",
    email: "support@futurenet.net",
    accountURL: "fnet.example.com",
    plan: "Enterprise (Yearly)",
    createdDate: "10 Feb 2024",
    status: "Active",
    logoUrl: "/logos/futurenet.png",
  },
];

const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>(
    initialAdminCompanies
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<AdminCompany | null>(
    null
  );
  const [companyToDeleteId, setCompanyToDeleteId] = useState<string | null>(
    null
  );

  const filteredCompanies = companies.filter((company) =>
    company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCompany = () => {
    setCurrentCompany(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditCompany = (company: AdminCompany) => {
    setCurrentCompany(company);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteCompany = (id: string) => {
    setCompanyToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (companyToDeleteId) {
      setCompanies(companies.filter((c) => c.id !== companyToDeleteId));
      setIsDeleteModalOpen(false);
      setCompanyToDeleteId(null);
    }
  };

  const handleSaveCompany = (company: AdminCompany) => {
    if (currentCompany) {
      setCompanies(companies.map((c) => (c.id === company.id ? company : c)));
    } else {
      setCompanies([...companies, { ...company, id: String(Date.now()) }]);
    }
    setIsAddEditModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-muted/40 dark:bg-gray-900 text-gray-900 dark:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          <div className="bg-white dark:bg-gray-900 shadow-lg rounded-3xl p-8 mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
              Companies
            </h1>

            <CompanyStats currentCompaniesData={companiesData} />

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Companies List
                </h2>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs rounded-full px-4 py-2 text-base border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  />
                  <Button
                    onClick={handleAddCompany}
                    className="rounded-full bg-black text-white hover:bg-gray-800 dark:bg-teal-600 dark:hover:bg-teal-700 px-6 py-2"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Company
                  </Button>
                </div>
              </div>

              <CompaniesTable
                companies={filteredCompanies}
                onEdit={handleEditCompany}
                onDelete={handleDeleteCompany}
              />
            </section>
          </div>
        </main>
      </div>

      <AddEditCompanyModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveCompany}
        companyToEdit={currentCompany}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminCompaniesPage;
