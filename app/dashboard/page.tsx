// app/dashboard/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      router.push("/login"); // Перенаправляем на страницу входа, если не авторизован
    }
  }, [router]);

  // Если пользователь не авторизован, можно вернуть null или лоадер, пока происходит редирект
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("isAuthenticated") !== "true"
  ) {
    return null; // Или загрузочный спиннер
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <Navbar />

      <main className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Welcome to Your CRM Dashboard!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1,234</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">56</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue (MTD)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$12,345</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
