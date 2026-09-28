"use client";

import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DateRangePreset = { value: string; label: string; hint: string };

export function DateRangeField({
  value,
  presets,
  onChange,
}: {
  value: string;
  presets: DateRangePreset[];
  onChange: (value: string) => void;
}) {
  const selected = presets.find((preset) => preset.value === value) ?? presets[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 font-normal">
          <CalendarDays className="size-3.5 text-muted-foreground" />
          {selected?.label ?? "Range"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <p className="px-2 py-1 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Range
        </p>
        <div className="mt-1 grid gap-1" role="listbox" aria-label="Date range">
          {presets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              role="option"
              aria-selected={preset.value === value}
              className={cn(
                "rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                preset.value === value && "bg-muted font-medium",
              )}
              onClick={() => onChange(preset.value)}
            >
              <span className="block">{preset.label}</span>
              <span className="block text-xs text-muted-foreground">{preset.hint}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
