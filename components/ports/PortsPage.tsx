"use client";

import React, { useState } from "react";
import PortsHeader from "@/components/ports/PortsHeader";
import PortsModal, { PortFormData } from "@/components/ports/PortsModal";
import PortsTable from "@/components/ports/portsTable";
import { PortsTabKey } from "@/components/ports/PortsTabs";

type FilterKey =
  | "flag"
  | "portname"
  | "unlocode"
  | "photo"
  | "vessels_in_port"
  | "vessels_departures"
  | "vessels_arrivals"
  | "vessels_expected_arrivals"
  | "local_time"
  | "anchorage"
  | "geographical_area_one"
  | "geographical_area_two"
  | "coverage";

export default function PortsPage({
  initialRows = [],
}: {
  initialRows?: any[];
}) {
  const [rows, setRows] = useState<any[]>(initialRows);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);
  const [tab, setTab] = useState<PortsTabKey>("ports");

  const [filters, setFilters] = useState<Record<string, string>>({});

  const setFilter = (key: FilterKey, value: string) =>
    setFilters((p) => ({ ...p, [key]: value }));
  const clearFilters = () => setFilters({});

  const handleAdd = (data: PortFormData) => setRows((p) => [...p, data]);
  const handleEdit = (data: PortFormData) =>
    setRows((p) => p.map((r) => (r.id === data.id ? { ...r, ...data } : r)));
  const handleDelete = (id: string) =>
    setRows((p) => p.filter((r) => r.id !== id));

  return (
    <div className="min-h-[100dvh] w-full px-4 sm:px-6 lg:px-8 py-6">
      <PortsHeader
        tab={tab}
        onTabChange={setTab}
        onAdd={() => setIsOpen(true)}
        onDeleteSelected={() => {
          setRows((p) => p.filter((r) => !selectedIds.includes(r.id)));
          setSelectedIds([]);
        }}
        onSearch={setQ}
        total={rows.length}
        selected={selectedIds.length}
        filters={filters}
        onSetFilter={setFilter}
        onClearFilters={clearFilters}
      />

      <div className="mt-6">
        {tab === "ports" ? (
          <PortsTable
            rows={rows}
            search={q}
            filters={filters}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onEdit={(r) => setEditRow(r)}
            onDelete={handleDelete}
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 text-sm text-slate-700 dark:text-gray-300">
            This section is locked in the demo.
          </div>
        )}
      </div>

      {/* Модалки */}
      {isOpen && (
        <PortsModal onClose={() => setIsOpen(false)} onSubmit={handleAdd} />
      )}
      {editRow && (
        <PortsModal
          initialData={editRow}
          onClose={() => setEditRow(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  );
}
