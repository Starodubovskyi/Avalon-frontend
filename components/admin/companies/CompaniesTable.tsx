import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Building2 } from "lucide-react";
import { AdminCompany } from "@/app/(admin)/admincompanies/page";

interface CompaniesTableProps {
  companies: AdminCompany[];
  onEdit: (company: AdminCompany) => void;
  onDelete: (id: string) => void;
}

const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">
              Company Name
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Email
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Account URL
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Plan
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Created Date
            </TableHead>
            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </TableHead>
            <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-xl">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
          {companies.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-4 text-gray-500 dark:text-gray-400"
              >
                No companies found.
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <TableRow
                key={company.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-3">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.companyName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                  )}
                  {company.companyName}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {company.email}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                  <a
                    href={`http://${company.accountURL}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company.accountURL}
                  </a>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {company.plan}{" "}
                  <Badge
                    variant="secondary"
                    className="bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200"
                  >
                    Upgrade
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {company.createdDate}
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      company.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {company.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(company)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(company.id)}
                    className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompaniesTable;
