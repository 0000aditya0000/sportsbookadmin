"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReferralUserListQuery } from "@/lib/validation/referrals";

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const levels = ["all", "1", "2", "3", "4", "5", "6"] as const;
const sources = ["all", "AGENT", "USER_REFERRAL"] as const;
const statuses = ["all", "active", "suspended", "banned", "locked"] as const;
const registered = ["all", "7d", "30d", "90d"] as const;
const sorts = ["registeredAt", "totalCommission", "displayName", "referralLevel"] as const;

export function useReferralParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const pageValue = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const pageSize = oneOf(searchParams.get("pageSize"), ["10", "20"], "10");
  const referrer = searchParams.get("referrer") ?? "all";
  const agent = searchParams.get("agent") ?? "all";
  const level = oneOf(searchParams.get("level"), levels, "all");
  const source = oneOf(searchParams.get("source"), sources, "all");
  const status = oneOf(searchParams.get("status"), statuses, "all");
  const registeredWindow = oneOf(searchParams.get("registered"), registered, "all");
  const sort = oneOf(searchParams.get("sort"), sorts, "registeredAt");
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

  const query: ReferralUserListQuery = {
    page,
    pageSize: Number(pageSize),
    q,
    referrer,
    agent,
    level,
    source,
    status,
    registered: registeredWindow,
    sort,
    direction,
  };

  return { ...query, update };
}
