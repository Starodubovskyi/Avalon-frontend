"use client";

import { useState } from "react";
import PortsTable from "./portsTable";
import PortsModal from "./PortsModal";
import PortsHeader from "./PortsHeader";
import mockPorts from "@/data/portsMockData";

const PortsPage = () => {
  const [ports, setPorts] = useState(
    mockPorts.map((p, i) => ({ ...p, id: `${i + 1}` }))
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<any>(null);
  const [search, setSearch] = useState("");

  const handleAdd = () => setIsModalOpen(true);
  const handleEdit = (port: any) => setEditingPort(port);
  const handleDelete = (id: string) =>
    setPorts((prev) => prev.filter((p) => p.id !== id));

  const handleDeleteSelected = () => {
    setPorts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
  };

  const handleSubmit = (port: any) => {
    if (editingPort) {
      setPorts((prev) => prev.map((p) => (p.id === port.id ? port : p)));
    } else {
      setPorts((prev) => [...prev, { ...port, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setEditingPort(null);
  };

  return (
    <div className="space-y-4">
      <PortsHeader
        onAdd={handleAdd}
        onDeleteSelected={handleDeleteSelected}
        hasSelected={selectedIds.length > 0}
        search={search}
        setSearch={setSearch}
      />

      <PortsTable
        data={ports}
        search={search}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {(isModalOpen || editingPort) && (
        <PortsModal
          initialData={editingPort}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPort(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default PortsPage;
