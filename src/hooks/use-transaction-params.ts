"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TransactionListQuery } from "@/lib/validation/transactions";

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const statuses = ["all", "posted", "pending", "failed"] as const;
const types = ["all", "deposit", "withdrawal", "bet_stake", "bet_settlement", "hold", "release", "adjustment", "commission"] as const;
const flows = ["all", "credit", "debit"] as const;
const created = ["all", "7d", "30d", "90d"] as const;
const sorts = ["createdAt", "amount", "status", "type"] as const;

export function useTransactionParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageValue = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = oneOf(searchParams.get("pageSize"), ["10", "20"], "10");
  const status = oneOf(searchParams.get("status"), statuses, "all");
  const type = oneOf(searchParams.get("type"), types, "all");
  const flow = oneOf(searchParams.get("flow"), flows, "all");
  const agent = searchParams.get("agent") ?? "all";
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

  const query: TransactionListQuery = {
    page,
    pageSize: Number(pageSize),
    q,
    status,
    type,
    flow,
    agent,
    created: createdWindow,
    sort,
    direction,
  };

  return { ...query, update };
}
