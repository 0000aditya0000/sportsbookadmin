"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { EventListQuery } from "@/lib/validation/events";

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const statuses = ["all", "scheduled", "live", "completed", "suspended", "cancelled", "postponed"] as const;
const starts = ["all", "today", "7d", "30d"] as const;
const timings = ["all", "live", "upcoming"] as const;
const sorts = ["startTime", "name", "competition", "status", "lastUpdated"] as const;

export function useEventParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageValue = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = oneOf(searchParams.get("pageSize"), ["10", "20"], "10");
  const sport = searchParams.get("sport") ?? "all";
  const competition = searchParams.get("competition") ?? "all";
  const status = oneOf(searchParams.get("status"), statuses, "all");
  const provider = searchParams.get("provider") ?? "all";
  const start = oneOf(searchParams.get("start"), starts, "all");
  const timing = oneOf(searchParams.get("timing"), timings, "all");
  const sort = oneOf(searchParams.get("sort"), sorts, "startTime");
  const direction = searchParams.get("direction") === "desc" ? "desc" : "asc";
  const q = searchParams.get("q") ?? "";

  function update(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const query: EventListQuery = {
    page,
    pageSize: Number(pageSize),
    q,
    sport,
    competition,
    status,
    provider,
    start,
    timing,
    sort,
    direction,
  };

  return { ...query, update };
}
