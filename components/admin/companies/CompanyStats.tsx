"use client"

import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, CheckCircle, XCircle, MapPin, PieChart as PieIcon } from "lucide-react"
import { AdminCompany } from "@/app/(admin)/admincompanies/page"

interface CompanyStatsProps {
  currentCompaniesData: AdminCompany[]
}

const COLORS = ["#10B981", "#EF4444"] // green, red

const CompanyStats: React.FC<CompanyStatsProps> = ({ currentCompaniesData }) => {
  const total = currentCompaniesData.length
  const active = currentCompaniesData.filter((c) => c.status === "Active").length
  const inactive = currentCompaniesData.filter((c) => c.status === "Inactive").length
  const locations = new Set(currentCompaniesData.map((c) => c.accountURL?.split(".")[1])).size

  const pieData = [
    { name: "Active", value: active },
    { name: "Inactive", value: inactive },
  ]

  return (
    <section className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <Card className="rounded-2xl shadow-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700 col-span-2">
        <CardHeader className="flex justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          <Building2 className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{active}</div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex justify-between pb-2">
          <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inactive}</div>
        </CardContent>
      </Card>
      <Card className="rounded-2xl shadow-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex justify-between pb-2">
          <CardTitle className="text-sm font-medium">Domains</CardTitle>
          <MapPin className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{locations}</div>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="col-span-5 md:col-span-2 rounded-2xl shadow-md dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
          <PieIcon className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                fill="#8884d8"
                label
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  )
}

export default CompanyStats
