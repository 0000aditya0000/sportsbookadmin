"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DashboardQuery } from "@/lib/validation/dashboard";

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function useTableParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageValue = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = oneOf(searchParams.get("pageSize"), ["6", "10", "20"], "6");
  const status = oneOf(searchParams.get("status"), ["all", "open", "live", "pending", "settled", "rejected"], "all");
  const range = oneOf(searchParams.get("range"), ["today", "7d", "14d"], "14d");
  const sort = oneOf(searchParams.get("sort"), ["placedAt", "stake", "event"], "placedAt");
  const dir = searchParams.get("dir") === "asc" ? "asc" : "desc";
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

  const query: DashboardQuery = {
    page,
    pageSize: Number(pageSize),
    q,
    status,
    range,
    sort,
    dir,
  };

  return { ...query, update };
}
