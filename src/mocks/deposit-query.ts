import { FINANCE_AS_OF, type DepositRecord } from "@/mocks/data/finance";
import type { DepositListQuery } from "@/lib/validation/deposits";

const AS_OF_MS = Date.parse(FINANCE_AS_OF);
const DAY_MS = 86_400_000;

function createdCutoff(created: DepositListQuery["created"]): number | null {
  if (created === "all") return null;
  const days = created === "7d" ? 7 : created === "30d" ? 30 : 90;
  return AS_OF_MS - days * DAY_MS;
}

function matches(item: DepositRecord, query: DepositListQuery): boolean {
  if (query.status !== "all" && item.status !== query.status) return false;
  if (query.agent !== "all" && item.agentId !== query.agent) return false;
  if (query.method !== "all" && item.method !== query.method) return false;
  const cutoff = createdCutoff(query.created);
  if (cutoff !== null && Date.parse(item.createdAt) < cutoff) return false;
  const needle = query.q.trim().toLowerCase();
  if (!needle) return true;
  return `${item.id} ${item.userId} ${item.userName} ${item.agentId} ${item.agentName} ${item.providerReference}`
    .toLowerCase()
    .includes(needle);
}

function compare(left: DepositRecord, right: DepositRecord, query: DepositListQuery): number {
  const direction = query.direction === "asc" ? 1 : -1;
  let delta = 0;
  switch (query.sort) {
    case "createdAt":
      delta = Date.parse(left.createdAt) - Date.parse(right.createdAt);
      break;
    case "updatedAt":
      delta = Date.parse(left.updatedAt) - Date.parse(right.updatedAt);
      break;
    case "amount":
      delta = left.amountMinor - right.amountMinor;
      break;
    case "status":
      delta = left.status.localeCompare(right.status);
      break;
    default: {
      const unreachable: never = query.sort;
      return unreachable;
    }
  }
  if (delta === 0) delta = left.id.localeCompare(right.id);
  return delta * direction;
}

export function queryDeposits(items: readonly DepositRecord[], query: DepositListQuery) {
  const filtered = items.filter((item) => matches(item, query));
  const sorted = [...filtered].sort((left, right) => compare(left, right, query));
  const start = (query.page - 1) * query.pageSize;
  return { items: sorted.slice(start, start + query.pageSize), total: sorted.length };
}

export function nextDepositStatus(status: DepositRecord["status"], action: "approve" | "reject") {
  if (status !== "pending") return null;
  return action === "approve" ? ("completed" as const) : ("rejected" as const);
}
