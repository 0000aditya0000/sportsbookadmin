"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AgentListQuery } from "@/lib/validation/agents";

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const statuses = ["all", "active", "suspended", "pending", "inactive"] as const;
const created = ["all", "7d", "30d", "90d"] as const;
const balances = ["all", "under_1l", "1l_10l", "over_10l"] as const;
const performances = ["all", "positive_ggr", "flat_ggr", "high_turnover"] as const;
const activities = ["all", "trading", "quiet"] as const;
const sorts = ["name", "users", "balance", "turnover", "ggr", "commission", "createdAt"] as const;

export function useAgentParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageValue = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = oneOf(searchParams.get("pageSize"), ["10", "20"], "10");
  const status = oneOf(searchParams.get("status"), statuses, "all");
  const createdWindow = oneOf(searchParams.get("created"), created, "all");
  const balance = oneOf(searchParams.get("balance"), balances, "all");
  const performance = oneOf(searchParams.get("performance"), performances, "all");
  const activity = oneOf(searchParams.get("activity"), activities, "all");
  const sort = oneOf(searchParams.get("sort"), sorts, "turnover");
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

  const query: AgentListQuery = {
    page,
    pageSize: Number(pageSize),
    q,
    status,
    created: createdWindow,
    balance,
    performance,
    activity,
    sort,
    direction,
  };

  return { ...query, update };
}
