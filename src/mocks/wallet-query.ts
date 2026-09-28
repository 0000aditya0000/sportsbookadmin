import { WALLET_AS_OF, type WalletAccountRecord } from "@/mocks/data/wallet";
import type { WalletListQuery } from "@/lib/validation/wallet";

const AS_OF_MS = Date.parse(WALLET_AS_OF);
const DAY_MS = 86_400_000;

function istDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function createdCutoff(created: WalletListQuery["created"]): number | null {
  if (created === "all") return null;
  const days = created === "7d" ? 7 : created === "30d" ? 30 : 90;
  return AS_OF_MS - days * DAY_MS;
}

function matchesBalance(totalMinor: number, balance: WalletListQuery["balance"]): boolean {
  if (balance === "all") return true;
  if (balance === "zero") return totalMinor === 0;
  if (balance === "negative") return totalMinor < 0;
  if (balance === "under_10k") return totalMinor > 0 && totalMinor < 1_000_000;
  if (balance === "10k_1l") return totalMinor >= 1_000_000 && totalMinor < 10_000_000;
  return totalMinor >= 10_000_000;
}

function matchesActivity(lastActivityAt: string | null, activity: WalletListQuery["activity"]): boolean {
  if (activity === "all") return true;
  if (activity === "quiet") return lastActivityAt === null || Date.parse(lastActivityAt) < AS_OF_MS - 7 * DAY_MS;
  if (!lastActivityAt) return false;
  if (activity === "today") return istDay(lastActivityAt) === istDay(WALLET_AS_OF);
  return Date.parse(lastActivityAt) >= AS_OF_MS - 7 * DAY_MS;
}

function matches(account: WalletAccountRecord, query: WalletListQuery): boolean {
  if (query.type !== "all" && account.ownerType !== query.type) return false;
  if (query.status !== "all" && account.status !== query.status) return false;
  if (query.agent !== "all" && account.agentId !== query.agent) return false;
  if (!matchesBalance(account.totalMinor, query.balance)) return false;
  if (!matchesActivity(account.lastActivityAt, query.activity)) return false;
  const cutoff = createdCutoff(query.created);
  if (cutoff !== null && Date.parse(account.createdAt) < cutoff) return false;
  const needle = query.q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    account.walletId,
    account.ownerId,
    account.ownerName,
    account.agentId ?? "",
    account.agentName ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

function compare(left: WalletAccountRecord, right: WalletAccountRecord, query: WalletListQuery): number {
  const direction = query.direction === "asc" ? 1 : -1;
  let delta = 0;
  switch (query.sort) {
    case "availableBalance":
      delta = left.availableMinor - right.availableMinor;
      break;
    case "heldBalance":
      delta = left.heldMinor - right.heldMinor;
      break;
    case "totalBalance":
      delta = left.totalMinor - right.totalMinor;
      break;
    case "lastActivity":
      delta = Date.parse(left.lastActivityAt ?? "1970-01-01") - Date.parse(right.lastActivityAt ?? "1970-01-01");
      break;
    case "createdAt":
      delta = Date.parse(left.createdAt) - Date.parse(right.createdAt);
      break;
    case "owner":
      delta = left.ownerName.localeCompare(right.ownerName);
      break;
    default: {
      const unreachable: never = query.sort;
      return unreachable;
    }
  }
  if (delta === 0) delta = left.walletId.localeCompare(right.walletId);
  return delta * direction;
}

export function queryWallets(accounts: readonly WalletAccountRecord[], query: WalletListQuery) {
  const filtered = accounts.filter((account) => matches(account, query));
  const sorted = [...filtered].sort((left, right) => compare(left, right, query));
  const start = (query.page - 1) * query.pageSize;
  return { items: sorted.slice(start, start + query.pageSize), total: sorted.length };
}
