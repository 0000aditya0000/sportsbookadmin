"use client";

import {
  columnVisibilityFeature,
  createColumnHelper,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type ColumnVisibilityState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Columns3 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/states/feedback-states";
import { cn } from "@/lib/utils";

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
});

export function createDataColumns<TData extends RowData>() {
  return createColumnHelper<typeof dataTableFeatures, TData>();
}

type DataTableProps<TData extends RowData & { id: string }> = {
  columns: ColumnDef<typeof dataTableFeatures, TData>[];
  data: TData[];
  caption: string;
  page: number;
  pageSize: number;
  total: number;
  sort?: { id: string; desc: boolean } | null;
  onSortChange?: (sort: { id: string; desc: boolean } | null) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
  error?: { message: string; requestId?: string } | null;
  onRetry?: () => void;
  emptyTitle: string;
  emptyDescription: string;
  enableSelection?: boolean;
  toolbarLabel?: string;
  hiddenColumnIds?: string[];
  pageSizeOptions?: number[];
};

export function DataTable<TData extends RowData & { id: string }>({
  columns,
  data,
  caption,
  page,
  pageSize,
  total,
  sort,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  enableSelection = false,
  toolbarLabel = "Operations",
  hiddenColumnIds = [],
  pageSizeOptions = [6, 10, 20],
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(() =>
    Object.fromEntries(hiddenColumnIds.map((id) => [id, false])),
  );
  const sorting = useMemo<SortingState>(() => (sort ? [{ id: sort.id, desc: sort.desc }] : []), [sort]);
  const helper = useMemo(() => createColumnHelper<typeof dataTableFeatures, TData>(), []);

  const resolvedColumns = useMemo(() => {
    if (!enableSelection) return columns;
    const selection = helper.display({
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all rows on this page"
          checked={table.getIsAllRowsSelected() ? true : table.getIsSomeRowsSelected() ? "indeterminate" : false}
          onCheckedChange={(value) => table.toggleAllRowsSelected(value === true)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select ${row.id}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
        />
      ),
    });
    return [selection, ...columns];
  }, [columns, enableSelection, helper]);

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns: resolvedColumns,
    getRowId: (row) => row.id,
    enableSortingRemoval: false,
    manualSorting: true,
    state: { sorting, rowSelection, columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const first = next[0];
      onSortChange?.(first ? { id: first.id, desc: first.desc } : null);
    },
    onRowSelectionChange: setRowSelection,
  });

  const selectedCount = Object.keys(rowSelection).length;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <p className="text-xs text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount} selected` : toolbarLabel}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3 className="size-3.5" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            {table.getAllLeafColumns().map((column) =>
              column.getCanHide() ? (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(value === true)}
                >
                  {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
                </DropdownMenuCheckboxItem>
              ) : null,
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="ops-scroll overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left" aria-busy={isLoading}>
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-muted/70">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getCanSort() ? header.column.getIsSorted() : false;
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}
                      className="px-3 py-2 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ChevronUp className="size-3" />
                          ) : sorted === "desc" ? (
                            <ChevronDown className="size-3" />
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-50" />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading && data.length === 0
              ? Array.from({ length: pageSize }).map((_, index) => (
                  <tr key={index} className="border-t border-border">
                    <td colSpan={table.getVisibleLeafColumns().length} className="px-3 py-2">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              : null}
            {error ? (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length}>
                  <ErrorState message={error.message} requestId={error.requestId} onRetry={onRetry} />
                </td>
              </tr>
            ) : null}
            {!error && !isLoading && data.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : null}
            {!error
              ? table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className={cn("border-t border-border", isLoading && "opacity-60")}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2 align-middle text-[13px]">
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2 border-t border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {start}–{end} of {total}
        </p>
        <div className="flex items-center gap-2">
          {onPageSizeChange ? (
            <Select
              aria-label="Rows per page"
              value={String(pageSize)}
              className="h-8 w-20"
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          ) : null}
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
