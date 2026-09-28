import { REFERRAL_AS_OF, type CommissionRecord, type ReferralLevel, type ReferralUserRecord } from "@/mocks/data/referrals";
import type { ReferralCommissionListQuery, ReferralUserListQuery } from "@/lib/validation/referrals";

const AS_OF_MS = Date.parse(REFERRAL_AS_OF);
const DAY_MS = 86_400_000;

function cutoff(window: "all" | "7d" | "30d" | "90d"): number | null {
  if (window === "all") return null;
  const days = window === "7d" ? 7 : window === "30d" ? 30 : 90;
  return AS_OF_MS - days * DAY_MS;
}

export function byId(users: readonly ReferralUserRecord[]): Map<string, ReferralUserRecord> {
  return new Map(users.map((user) => [user.userId, user]));
}

/** Distance from ancestor → descendant (1–6), or null if not within six levels. */
export function levelUnder(
  users: readonly ReferralUserRecord[],
  ancestorId: string,
  descendantId: string,
): ReferralLevel | null {
  const map = byId(users);
  let current = map.get(descendantId);
  let depth = 0;
  while (current?.directReferrerId) {
    depth += 1;
    if (depth > 6) return null;
    if (current.directReferrerId === ancestorId) return depth as ReferralLevel;
    current = map.get(current.directReferrerId);
  }
  return null;
}

export function uplineChain(users: readonly ReferralUserRecord[], userId: string): ReferralUserRecord[] {
  const map = byId(users);
  const chain: ReferralUserRecord[] = [];
  let current = map.get(userId);
  while (current?.directReferrerId && chain.length < 6) {
    const parent = map.get(current.directReferrerId);
    if (!parent) break;
    chain.push(parent);
    current = parent;
  }
  return chain;
}

export function childrenOf(users: readonly ReferralUserRecord[], parentId: string): ReferralUserRecord[] {
  return users.filter((user) => user.directReferrerId === parentId);
}

export function queryReferralUsers(
  users: readonly ReferralUserRecord[],
  commissions: readonly CommissionRecord[],
  query: ReferralUserListQuery,
) {
  const map = byId(users);
  const commissionByUser = new Map<string, number>();
  for (const item of commissions) {
    commissionByUser.set(item.beneficiaryId, (commissionByUser.get(item.beneficiaryId) ?? 0) + item.commissionAmountMinor);
  }

  const filtered = users.filter((user) => {
    if (query.referrer !== "all" && user.directReferrerId !== query.referrer) return false;
    if (query.agent !== "all" && user.agentOwnerId !== query.agent) return false;
    if (query.source !== "all" && user.acquisitionSource !== query.source) return false;
    if (query.status !== "all" && user.status !== query.status) return false;
    const registeredCut = cutoff(query.registered);
    if (registeredCut !== null && Date.parse(user.registeredAt) < registeredCut) return false;
    if (query.level !== "all") {
      const wanted = Number(query.level) as ReferralLevel;
      const referrer = user.directReferrerId;
      if (!referrer) return false;
      // Level filter: depth under the user's direct chain root scope — use distance from immediate? Spec says Level filter means referral level.
      // For list, "level" means depth under their direct referrer's perspective isn't right.
      // Spec: Level 1 under A means B referred by A. So level = depth from... when filtering list globally, we treat level as depth under the top of each user's upline within 6, OR depth from immediate parent (always 1 for anyone with referrer).
      // Looking at the overview columns "Referral Level" — for a user under Aditya at depth 2, show 2 when viewing Aditya's network.
      // For global list without a root, common approach: show depth from the user's ultimate root capped at 6, or null for agent-acquired roots.
      const chain = uplineChain(users, user.userId);
      if (chain.length !== wanted) return false;
    }
    const needle = query.q.trim().toLowerCase();
    if (!needle) return true;
    const referrer = user.directReferrerId ? map.get(user.directReferrerId) : null;
    return `${user.userId} ${user.displayName} ${user.referralCode} ${user.phone} ${referrer?.displayName ?? ""} ${referrer?.userId ?? ""}`
      .toLowerCase()
      .includes(needle);
  });

  const sorted = [...filtered].sort((left, right) => {
    const direction = query.direction === "asc" ? 1 : -1;
    let delta = 0;
    switch (query.sort) {
      case "registeredAt":
        delta = Date.parse(left.registeredAt) - Date.parse(right.registeredAt);
        break;
      case "totalCommission":
        delta = (commissionByUser.get(left.userId) ?? 0) - (commissionByUser.get(right.userId) ?? 0);
        break;
      case "displayName":
        delta = left.displayName.localeCompare(right.displayName);
        break;
      case "referralLevel": {
        const leftLevel = uplineChain(users, left.userId).length;
        const rightLevel = uplineChain(users, right.userId).length;
        delta = leftLevel - rightLevel;
        break;
      }
      default: {
        const unreachable: never = query.sort;
        return unreachable;
      }
    }
    if (delta === 0) delta = left.userId.localeCompare(right.userId);
    return delta * direction;
  });

  const start = (query.page - 1) * query.pageSize;
  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    commissionByUser,
  };
}

export function queryCommissions(items: readonly CommissionRecord[], query: ReferralCommissionListQuery) {
  const filtered = items.filter((item) => {
    if (query.beneficiary !== "all" && item.beneficiaryId !== query.beneficiary) return false;
    if (query.betUser !== "all" && item.betUserId !== query.betUser) return false;
    if (query.level !== "all" && String(item.level) !== query.level) return false;
    if (query.agent !== "all" && item.agentOwnerId !== query.agent) return false;
    if (query.status !== "all" && item.status !== query.status) return false;
    if (query.betId.trim() && !item.betId.toLowerCase().includes(query.betId.trim().toLowerCase())) return false;
    const createdCut = cutoff(query.created);
    if (createdCut !== null && Date.parse(item.createdAt) < createdCut) return false;
    const needle = query.q.trim().toLowerCase();
    if (!needle) return true;
    return `${item.id} ${item.betId} ${item.betUserId} ${item.betUserName} ${item.beneficiaryId} ${item.beneficiaryName} ${item.ledgerTransactionId ?? ""}`
      .toLowerCase()
      .includes(needle);
  });

  const sorted = [...filtered].sort((left, right) => {
    const direction = query.direction === "asc" ? 1 : -1;
    let delta = 0;
    switch (query.sort) {
      case "createdAt":
        delta = Date.parse(left.createdAt) - Date.parse(right.createdAt);
        break;
      case "betAmount":
        delta = left.betAmountMinor - right.betAmountMinor;
        break;
      case "commissionAmount":
        delta = left.commissionAmountMinor - right.commissionAmountMinor;
        break;
      case "level":
        delta = left.level - right.level;
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
  });

  const start = (query.page - 1) * query.pageSize;
  return { items: sorted.slice(start, start + query.pageSize), total: sorted.length };
}
