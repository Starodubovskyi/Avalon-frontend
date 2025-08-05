// components/admin/companies/CompaniesTable.tsx
import React from "react"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash, Building2, History } from "lucide-react"
import { AdminCompany } from "@/app/(admin)/admincompanies/page"

interface CompaniesTableProps {
  companies: AdminCompany[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onDelete: (id: string) => void
  onEdit: (company: AdminCompany) => void
  onChangeStatus: (id: string, status: "Active" | "Inactive") => void
  onViewHistory: (company: AdminCompany) => void
}

const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDelete,
  onEdit,
  onChangeStatus,
  onViewHistory,
}) => {
  const isAllSelected = companies.length > 0 && selectedIds.length === companies.length

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleSelectAll}
            className="w-5 h-5"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Select All
          </span>
        </div>
        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            className="rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-1"
            onClick={() => selectedIds.forEach((id) => onDelete(id))}
          >
            Delete selected ({selectedIds.length})
          </Button>
        )}
      </div>

      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableHead className="px-4 py-3 w-10"></TableHead>
            <TableHead className="px-6 py-3">Company Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Account URL</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white dark:bg-gray-950 divide-y dark:divide-gray-800">
          {companies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                No companies found.
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <TableRow key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(company.id)}
                    onChange={() => onToggleSelect(company.id)}
                    className="w-5 h-5"
                  />
                </TableCell>
                <TableCell className="px-6 py-4 flex items-center gap-3">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.companyName} className="w-8 h-8 rounded-full" />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-400" />
                  )}
                  {company.companyName}
                </TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>
                  <a href={`http://${company.accountURL}`} target="_blank" className="text-blue-600 dark:text-blue-400">
                    {company.accountURL}
                  </a>
                </TableCell>
                <TableCell>
                  {company.plan}{" "}
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
                  >
                    Upgrade
                  </Badge>
                </TableCell>
                <TableCell>{company.createdDate}</TableCell>
                <TableCell>
                  <select
                    value={company.status}
                    onChange={(e) =>
                      onChangeStatus(company.id, e.target.value as "Active" | "Inactive")
                    }
                    className="bg-transparent border-none text-sm font-medium text-green-600 dark:text-green-300"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(company)}>
                    <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onDelete(company.id)}>
                    <Trash className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onViewHistory(company)}>
                    <History className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default CompaniesTable
