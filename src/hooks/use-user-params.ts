"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { UserListQuery } from "@/lib/validation/users";

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const statuses = ["all", "active", "suspended", "banned", "locked"] as const;
const created = ["all", "7d", "30d", "90d"] as const;
const balances = ["all", "under_10k", "10k_1l", "over_1l"] as const;
const activities = ["all", "online", "quiet"] as const;
const betting = ["all", "open", "settled", "none"] as const;
const sorts = ["name", "id", "agent", "balance", "openBets", "turnover", "lastLogin", "createdAt"] as const;

export function useUserParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageValue = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = oneOf(searchParams.get("pageSize"), ["10", "20"], "10");
  const status = oneOf(searchParams.get("status"), statuses, "all");
  const agent = searchParams.get("agent") ?? "all";
  const createdWindow = oneOf(searchParams.get("created"), created, "all");
  const balance = oneOf(searchParams.get("balance"), balances, "all");
  const activity = oneOf(searchParams.get("activity"), activities, "all");
  const bettingActivity = oneOf(searchParams.get("betting"), betting, "all");
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

  const query: UserListQuery = {
    page,
    pageSize: Number(pageSize),
    q,
    status,
    agent,
    created: createdWindow,
    balance,
    activity,
    betting: bettingActivity,
    sort,
    direction,
  };

  return { ...query, update };
}
