"use client";

import { Search } from "lucide-react";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { DateRangeField, type DateRangePreset } from "@/components/ui/date-range-field";
import { Input } from "@/components/ui/input";

export function FilterBar({
  search,
  onSearch,
  status,
  statusOptions,
  onStatus,
  range,
  rangePresets,
  onRange,
  searchPlaceholder = "Search event, market, or bet reference",
  searchLabel = "Search operations",
  children,
}: {
  search: string;
  onSearch: (value: string) => void;
  status: string;
  statusOptions: ComboboxOption[];
  onStatus: (value: string) => void;
  range: string;
  rangePresets: DateRangePreset[];
  onRange: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          className="h-9 pl-8"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Combobox label="Status" value={status} options={statusOptions} onChange={onStatus} />
        <DateRangeField value={range} presets={rangePresets} onChange={onRange} />
        {children}
      </div>
    </div>
  );
}
