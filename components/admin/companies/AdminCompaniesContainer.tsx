"use client";
import { useEffect, useMemo } from "react";
import { useAdminCompaniesStore } from "./store/adminCompaniesStore";
import AdminCompaniesView from "@/components/admin/companies/AdminCompaniesView";
import type { AdminCompany, CompanyStatus } from "./types";

export default function AdminCompaniesContainer() {
  const {
    items,
    filters,
    sort,
    setFilter,
    resetFilters,
    selectedIds,
    loadMock,
    selectAll,
    clearSelection,
  } = useAdminCompaniesStore();

  useEffect(() => {
    if (items.length === 0) loadMock();
  }, [items.length, loadMock]);

  const filtered = useMemo<AdminCompany[]>(() => {
    const text = filters.search.trim().toLowerCase();
    let list = items.filter((it) => {
      const matchesText =
        !text ||
        [it.name, it.city, it.category, it.owner, it.country]
          .join(" ")
          .toLowerCase()
          .includes(text);
      const matchesCountry =
        filters.country === "all" || it.country === filters.country;
      const matchesCategory =
        filters.category === "all" || it.category === filters.category;
      const matchesStatus =
        filters.status === "all" || it.status === filters.status;
      return matchesText && matchesCountry && matchesCategory && matchesStatus;
    });

    list = list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.field === "name") return a.name.localeCompare(b.name) * dir;
      if (sort.field === "country")
        return a.country.localeCompare(b.country) * dir;
      if (sort.field === "city") return a.city.localeCompare(b.city) * dir;
      if (sort.field === "status")
        return a.status.localeCompare(b.status) * dir;
      if (sort.field === "completeness")
        return ((a.completeness || 0) - (b.completeness || 0)) * dir;
      return (
        (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) *
        dir
      );
    });
    return list;
  }, [items, filters, sort]);

  const allIds = filtered.map((x) => x.id);

  const countries = useMemo(
    () => Array.from(new Set(items.map((x) => x.country))),
    [items]
  );
  const categories = useMemo(
    () => Array.from(new Set(items.map((x) => x.category))),
    [items]
  );
  const statuses: CompanyStatus[] = [
    "draft",
    "pending",
    "published",
    "suspended",
    "archived",
  ];

  return (
    <AdminCompaniesView
      items={filtered}
      filters={filters}
      setFilter={setFilter}
      resetFilters={resetFilters}
      countries={countries}
      categories={categories}
      statuses={statuses}
      selectedIds={selectedIds}
      allIds={allIds}
      selectAll={selectAll}
      clearSelection={clearSelection}
    />
  );
}
