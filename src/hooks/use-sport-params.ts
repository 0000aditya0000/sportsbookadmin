"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SportListQuery } from "@/lib/validation/sports";

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const statuses = ["all", "active", "inactive", "suspended"] as const;
const activities = ["all", "live", "quiet"] as const;
const updated = ["all", "7d", "30d", "90d"] as const;
const sorts = ["name", "competitions", "upcomingEvents", "liveEvents", "totalEvents", "lastUpdated"] as const;

export function useSportParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageValue = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = oneOf(searchParams.get("pageSize"), ["10", "20"], "10");
  const status = oneOf(searchParams.get("status"), statuses, "all");
  const provider = searchParams.get("provider") ?? "all";
  const activity = oneOf(searchParams.get("activity"), activities, "all");
  const updatedWindow = oneOf(searchParams.get("updated"), updated, "all");
  const sort = oneOf(searchParams.get("sort"), sorts, "liveEvents");
  const direction = searchParams.get("direction") === "asc" ? "asc" : "desc";
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

  const query: SportListQuery = {
    page,
    pageSize: Number(pageSize),
    q,
    status,
    provider,
    activity,
    updated: updatedWindow,
    sort,
    direction,
  };

  return { ...query, update };
}
