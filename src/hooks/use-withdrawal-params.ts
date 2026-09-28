"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { WithdrawalListQuery } from "@/lib/validation/withdrawals";

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const statuses = ["all", "pending", "approved", "rejected", "paid", "failed"] as const;
const methods = ["all", "UPI", "Bank transfer"] as const;
const created = ["all", "7d", "30d", "90d"] as const;
const sorts = ["createdAt", "amount", "status", "updatedAt"] as const;

export function useWithdrawalParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageValue = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = oneOf(searchParams.get("pageSize"), ["10", "20"], "10");
  const status = oneOf(searchParams.get("status"), statuses, "all");
  const agent = searchParams.get("agent") ?? "all";
  const method = oneOf(searchParams.get("method"), methods, "all");
  const createdWindow = oneOf(searchParams.get("created"), created, "all");
  const sort = oneOf(searchParams.get("sort"), sorts, "createdAt");
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

  const query: WithdrawalListQuery = {
    page,
    pageSize: Number(pageSize),
    q,
    status,
    agent,
    method,
    created: createdWindow,
    sort,
    direction,
  };

  return { ...query, update };
}
