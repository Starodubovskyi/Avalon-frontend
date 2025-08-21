"use client";

import React, { useState } from "react";
import PortsHeader from "./PortsHeader";
import PortsModal, { PortFormData } from "./PortsModal";
import PortsTable from "./portsTable";
import { PortsTabKey } from "./PortsTabs";

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
    <div className="w-full">
      <div
        className="sticky top-0 z-20 backdrop-blur 
                   supports-[backdrop-filter]:bg-white/60 
                   dark:supports-[backdrop-filter]:bg-black/40
                   bg-white dark:bg-black 
                   px-3 sm:px-6 pt-4 sm:pt-6 pb-3 
                   border-b border-gray-200 dark:border-white/10 
                   overflow-hidden"
      >
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
      </div>

      <div className="px-3 sm:px-6 py-4 sm:py-6">
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
