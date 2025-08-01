"use client";

import ColumnsDropdown from "@/components/dashboard/ports.tsx/columnsDropdown";
import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  VisibilityState,
} from "@tanstack/react-table";
import Image from "next/image";
import Port from "@/components/types/port";

interface PortsTableProps {
  data: Port[];
  search: string;
}

const PortsTable: React.FC<PortsTableProps> = ({ data, search }) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.port.toLowerCase().includes(search.toLowerCase()) ||
        item.unlocode.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const columns = useMemo<ColumnDef<Port>[]>(
    () => [
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Image
              src={row.original.countryFlag}
              alt={row.original.country}
              width={24}
              height={16}
            />
            <span>{row.original.country}</span>
          </div>
        ),
      },
      {
        accessorKey: "port",
        header: "Port",
        cell: ({ getValue }) => (
          <span className="text-blue-600 font-semibold">
            {getValue<string>()}
          </span>
        ),
      },
      { accessorKey: "unlocode", header: "UN/LOCODE" },
      {
        accessorKey: "photo",
        header: "Photo",
        cell: ({ getValue }) => (
          <Image
            src={getValue<string>()}
            alt="port"
            width={80}
            height={50}
            className="rounded object-cover"
          />
        ),
      },
      { accessorKey: "vessels", header: "Vessels in Port" },
      { accessorKey: "departures", header: "Departures (last 24hrs)" },
      { accessorKey: "arrivals", header: "Arrivals (last 24hrs)" },
      { accessorKey: "expectedArrivals", header: "Expected Arrivals" },
      { accessorKey: "localTime", header: "Local Time" },
      {
        accessorKey: "anchorage",
        header: "Related Anchorage",
        cell: ({ getValue }) => (
          <a href="#" className="text-blue-600 hover:underline">
            {getValue<string>()}
          </a>
        ),
      },
      { accessorKey: "areaGlobal", header: "Area Global" },
      { accessorKey: "areaLocal", header: "Area Local" },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
  });

  return (
    <div className="overflow-auto border rounded max-w-full">
      {/* Колонки — кнопка ColumnsDropdown, если у тебя реализована */}
      <ColumnsDropdown table={table} />

      <table className="min-w-[1200px] w-full text-sm">
        <thead className="bg-gray-100 dark:bg-neutral-800 text-black dark:text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2 text-left font-medium">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PortsTable;
