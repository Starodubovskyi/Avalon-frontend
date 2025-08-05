// components/admin/companies/CompanyStats.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, XCircle, MapPin } from "lucide-react";

interface Company {
  name: string;
  category: string;
  country: string;
  city: string;
  logoUrl: string;
}

interface CompanyStatsProps {
  currentCompaniesData: Company[]; 
}

const CompanyStats: React.FC<CompanyStatsProps> = ({
  currentCompaniesData,
}) => {
  const totalCompanies = currentCompaniesData.length;
  
  const activeCompanies = currentCompaniesData.length;
  const inactiveCompanies = 0; 
  const companyLocations = new Set(currentCompaniesData.map((c) => c.country))
    .size;

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="rounded-2xl shadow-md dark:bg-gray-800 transition-transform hover:scale-[1.02] hover:shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Companies
          </CardTitle>
          <Building2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCompanies}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            +20.1% from last month
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-md dark:bg-gray-800 transition-transform hover:scale-[1.02] hover:shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Active Companies
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCompanies}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            +15% from last month
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-md dark:bg-gray-800 transition-transform hover:scale-[1.02] hover:shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Inactive Companies
          </CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactiveCompanies}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            -5% from last month
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-md dark:bg-gray-800 transition-transform hover:scale-[1.02] hover:shadow-lg border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Company Locations
          </CardTitle>
          <MapPin className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{companyLocations}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Diverse presence
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default CompanyStats;
