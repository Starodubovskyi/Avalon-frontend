"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Port from "@/components/types/port";

interface PortsTableProps {
  data: Port[];
  search: string;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  onEdit: (port: Port) => void;
  onDelete: (id: string) => void;
}

const PortsTable: React.FC<PortsTableProps> = ({
  data,
  search,
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
}) => {
  const columns = useMemo<ColumnDef<Port>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
      },
      {
        accessorKey: "port",
        header: "Port",
      },
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => {
          const src = row.original.countryFlag;
          const isValid =
            src?.startsWith("/") ||
            src?.startsWith("http") ||
            src?.startsWith("data:image");

          return (
            <div className="flex items-center gap-2">
              {isValid ? (
                <Image
                  src={src}
                  alt={row.original.country}
                  width={24}
                  height={16}
                  className="rounded-sm border"
                />
              ) : (
                <div className="w-6 h-4 bg-gray-200 dark:bg-neutral-600 rounded-sm" />
              )}
              <span>{row.original.country}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "photo",
        header: "Photo",
        cell: ({ getValue }) => {
          const src = getValue<string>();
          const isValid =
            src?.startsWith("/") ||
            src?.startsWith("http") ||
            src?.startsWith("data:image");

          return isValid ? (
            <Image
              src={src}
              alt="port"
              width={80}
              height={50}
              className="rounded object-cover"
            />
          ) : (
            <div className="w-20 h-[50px] bg-gray-100 dark:bg-neutral-700 rounded" />
          );
        },
      },
      {
        accessorKey: "vessels",
        header: "🛳 Vessels",
      },
      {
        accessorKey: "localTime",
        header: "⏰ Local Time",
      },
      {
        accessorKey: "anchorage",
        header: "⚓ Anchorage",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(row.original)}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(row.original.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  const filteredData = useMemo(() => {
    return data.filter((port) =>
      port.port.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection: Object.fromEntries(selectedIds.map((id) => [id, true])),
    },
    onRowSelectionChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater(
          Object.fromEntries(selectedIds.map((id) => [id, true]))
        );
        const selected = Object.entries(newState)
          .filter(([, selected]) => selected)
          .map(([id]) => id);
        setSelectedIds(selected);
      } else if (Array.isArray(updater)) {
        setSelectedIds(updater);
      }
    },
    enableRowSelection: true,
  });

  return (
    <div
      className="
      bg-white 
      border border-gray-200 
      shadow 
      rounded-2xl p-6 overflow-x-auto
      dark:bg-white/5 dark:border-white/10 dark:shadow-white/10
    "
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 font-medium">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y dark:divide-neutral-700">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortsTable;
