"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SimpleColumn<T extends string = string> = { key: T; label: string };


type ColumnsDropdownPropsTable = {
  table: any; 
  className?: string;
  label?: string;
};

type ColumnsDropdownPropsSimple<T extends string = string> = {
  table?: undefined;
  allColumns: SimpleColumn<T>[];
  visible: Record<T, boolean>;
  onToggle: (key: T) => void;
  className?: string;
  label?: string;
};

type ColumnsDropdownProps<T extends string = string> =
  | ColumnsDropdownPropsTable
  | ColumnsDropdownPropsSimple<T>;

export default function ColumnsDropdown<T extends string = string>(
  props: ColumnsDropdownProps<T>
) {
  const label = (props as any).label ?? "Columns";

  if ("table" in props && props.table) {
    const { table, className } = props as ColumnsDropdownPropsTable;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition ${
              className || ""
            }`}
          >
            {label}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto bg-white border border-gray-200 shadow rounded-2xl dark:bg-white/5 dark:border-white/10 dark:shadow-white/10">
          {table
            .getAllColumns?.()
            ?.filter((column: any) => column.getCanHide?.())
            ?.map((column: any) => {
              const colId =
                column.id ??
                column.columnDef?.id ??
                column.columnDef?.accessorKey ??
                "";
              const colLabel =
                column.columnDef?.header ??
                column.columnDef?.meta?.label ??
                colId ??
                "Column";
              return (
                <DropdownMenuCheckboxItem
                  key={colId}
                  className="capitalize"
                  checked={!!column.getIsVisible?.()}
                  onCheckedChange={() => column.toggleVisibility?.()}
                >
                  {String(colLabel)}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const { allColumns, visible, onToggle, className } =
    props as ColumnsDropdownPropsSimple<T>;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition ${
            className || ""
          }`}
        >
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto bg-white border border-gray-200 shadow rounded-2xl dark:bg-white/5 dark:border-white/10 dark:shadow-white/10">
        {allColumns.map(({ key, label }) => (
          <DropdownMenuCheckboxItem
            key={key as string}
            checked={!!visible[key]}
            onCheckedChange={() => onToggle(key)}
            className="capitalize"
          >
            {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
