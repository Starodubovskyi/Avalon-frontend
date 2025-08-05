"use client"

import { useState, useEffect } from "react"
// import Sidebar from "@/components/layout/Sidebar"
import CompanyStats from "@/components/admin/companies/CompanyStats"
import CompaniesTable from "@/components/admin/companies/CompaniesTable"
import AddEditCompanyModal from "@/components/admin/companies/AddEditCompanyModal"
import DeleteConfirmationModal from "@/components/admin/companies/DeleteConfirmationModal"
import HistoryModal from "@/components/admin/companies/HistoryModal"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import MainLayout from "@/components/layout/MainLayout"

export interface AdminCompany {
  id: string
  companyName?: string
  name?: string
  email?: string
  accountURL?: string
  plan?: string
  createdDate?: string
  status?: "Active" | "Inactive"
  logoUrl?: string
  history?: string[]
  category?: string
  country?: string
  city?: string
}

const initialAdminCompanies: AdminCompany[] = [
  {
    id: "100",
    companyName: "BrightWave Innovations",
    email: "michael@example.com",
    accountURL: "bwi.example.com",
    plan: "Advanced (Monthly)",
    createdDate: "12 Sep 2024",
    status: "Active",
    logoUrl: "/logos/brightwave.png",
    history: ["Created on 12 Sep 2024", "Status set to Active"],
  },
  {
    id: "101",
    companyName: "Stellar Dynamics",
    email: "sophie@example.com",
    accountURL: "sd.example.com",
    plan: "Basic (Yearly)",
    createdDate: "24 Oct 2024",
    status: "Inactive",
    logoUrl: "/logos/stellar.png",
    history: ["Created on 24 Oct 2024", "Deactivated on 01 Aug 2025"],
  },
]

const AdminCompaniesPage = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>(initialAdminCompanies)
  const [userCompanies, setUserCompanies] = useState<AdminCompany[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [companyToDeleteId, setCompanyToDeleteId] = useState<string | null>(null)
  const [currentCompany, setCurrentCompany] = useState<AdminCompany | null>(null)
  const [historyCompany, setHistoryCompany] = useState<AdminCompany | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("userCompanies")
    if (saved) setUserCompanies(JSON.parse(saved))
  }, [])

  // Объединяем для отображения
  const allCompanies = [...companies, ...userCompanies]

  const filteredCompanies = allCompanies.filter((company) => {
    const name = company.companyName || company.name || ""
    return name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Удаление компании (разные действия для админских и пользовательских)
  const deleteUserCompany = (id: string) => {
    const saved = JSON.parse(localStorage.getItem("userCompanies") || "[]")
    const filtered = saved.filter((c: AdminCompany) => c.id !== id)
    localStorage.setItem("userCompanies", JSON.stringify(filtered))
    setUserCompanies(filtered)
  }

  const handleDeleteCompany = (id: string) => {
    if (companies.find((c) => c.id === id)) {
      setCompanies((prev) => prev.filter((c) => c.id !== id))
    } else {
      deleteUserCompany(id)
    }
    setSelectedIds((prev) => prev.filter((selId) => selId !== id))
  }

  const handleChangeStatus = (id: string, newStatus: "Active" | "Inactive") => {
    if (companies.find((c) => c.id === id)) {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: newStatus,
                history: [...(c.history || []), `Status changed to ${newStatus}`],
              }
            : c
        )
      )
    } else {
      const updated = userCompanies.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              history: [...(c.history || []), `Status changed to ${newStatus}`],
            }
          : c
      )
      setUserCompanies(updated)
      localStorage.setItem("userCompanies", JSON.stringify(updated))
    }
  }

  const handleSaveCompany = (company: AdminCompany) => {
    if (currentCompany) {
      if (companies.find((c) => c.id === company.id)) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === company.id ? company : c))
        )
      } else {
        const updated = userCompanies.map((c) =>
          c.id === company.id ? company : c
        )
        setUserCompanies(updated)
        localStorage.setItem("userCompanies", JSON.stringify(updated))
      }
    } else {
      setCompanies((prev) => [...prev, { ...company, id: String(Date.now()) }])
    }
    setIsAddEditModalOpen(false)
  }

  return (
    <MainLayout>
    <div className="flex min-h-screen bg-muted/40 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          <div className="bg-white dark:bg-gray-900 shadow-lg rounded-3xl p-8 mb-8">
            <h1 className="text-4xl font-extrabold mb-6">Companies</h1>

            <CompanyStats currentCompaniesData={allCompanies} />

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Companies List</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs rounded-full px-4 py-2 text-base border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950"
                  />
                  <Button
                    onClick={() => {
                      setCurrentCompany(null)
                      setIsAddEditModalOpen(true)
                    }}
                    className="rounded-full px-6 py-2"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Company
                  </Button>
                </div>
              </div>

              <CompaniesTable
                companies={filteredCompanies}
                selectedIds={selectedIds}
                onToggleSelect={(id) =>
                  setSelectedIds((prev) =>
                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                  )
                }
                onToggleSelectAll={() => {
                  if (selectedIds.length === filteredCompanies.length) {
                    setSelectedIds([])
                  } else {
                    setSelectedIds(filteredCompanies.map((c) => c.id))
                  }
                }}
                onDelete={handleDeleteCompany}
                onEdit={(company) => {
                  setCurrentCompany(company)
                  setIsAddEditModalOpen(true)
                }}
                onChangeStatus={handleChangeStatus}
                onViewHistory={(company) => setHistoryCompany(company)}
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
        onConfirm={() => {
          if (companyToDeleteId) handleDeleteCompany(companyToDeleteId)
          setIsDeleteModalOpen(false)
          setCompanyToDeleteId(null)
        }}
      />

      <HistoryModal
        company={historyCompany}
        onClose={() => setHistoryCompany(null)}
      />
    </div>
    </MainLayout>
  )
}

export default AdminCompaniesPage
