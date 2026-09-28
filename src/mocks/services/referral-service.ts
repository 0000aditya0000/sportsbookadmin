import "server-only";

import type { Money } from "@/lib/format";
import type { SearchResult } from "@/lib/validation/search";
import {
  agentReferralDetailSchema,
  commissionConfigResponseSchema,
  referralCommissionDetailSchema,
  referralCommissionListResponseSchema,
  referralReportResponseSchema,
  referralTreeResponseSchema,
  referralUserListResponseSchema,
  userReferralDetailSchema,
  type AgentReferralDetail,
  type CommissionConfigResponse,
  type CommissionConfigUpdate,
  type ReferralCommissionDetail,
  type ReferralCommissionListQuery,
  type ReferralCommissionListResponse,
  type ReferralLevel,
  type ReferralReportQuery,
  type ReferralReportResponse,
  type ReferralTreeResponse,
  type ReferralUserListQuery,
  type ReferralUserListResponse,
  type UserReferralDetail,
} from "@/lib/validation/referrals";
import {
  commissionSummaryFixture,
  formatRatePercent,
  parseRatePercentToBps,
  REFERRAL_AS_OF,
  referralSummaryFixture,
  seedCommissionConfig,
  seedCommissions,
  seedReferralUsers,
  type CommissionConfigRecord,
  type CommissionRecord,
  type ReferralUserRecord,
} from "@/mocks/data/referrals";
import {
  byId,
  childrenOf,
  queryCommissions,
  queryReferralUsers,
  uplineChain,
} from "@/mocks/referral-query";

type ServiceError = { ok: false; code: "NOT_FOUND" | "CONFLICT" | "VALIDATION_ERROR"; message: string };
type ServiceOk<T> = { ok: true; data: T };

function money(amountMinor: number): Money {
  return { amountMinor, currency: "INR" };
}

const users: ReferralUserRecord[] = seedReferralUsers.map((item) => ({ ...item }));
const commissions: CommissionRecord[] = seedCommissions.map((item) => ({ ...item }));
const config: CommissionConfigRecord[] = seedCommissionConfig.map((item) => ({ ...item }));
let revisedAt = REFERRAL_AS_OF;

function agents() {
  return [
    ...new Map(users.map((item) => [item.agentOwnerId, { id: item.agentOwnerId, name: item.agentOwnerName }])).values(),
  ].sort((left, right) => left.name.localeCompare(right.name));
}

function referrerName(userId: string | null): string | null {
  if (!userId) return null;
  return byId(users).get(userId)?.displayName ?? null;
}

function toListItem(user: ReferralUserRecord, commissionMinor: number) {
  const chain = uplineChain(users, user.userId);
  const level = chain.length === 0 ? null : (chain.length as ReferralLevel);
  return {
    id: user.userId,
    displayName: user.displayName,
    referralCode: user.referralCode,
    directReferrerId: user.directReferrerId,
    directReferrerName: referrerName(user.directReferrerId),
    referralLevel: level,
    agentOwnerId: user.agentOwnerId,
    agentOwnerName: user.agentOwnerName,
    acquisitionSource: user.acquisitionSource,
    registeredAt: user.registeredAt,
    status: user.status,
    totalCommission: money(commissionMinor),
  };
}

function summaryPayload() {
  const fixture = referralSummaryFixture;
  return {
    totalReferralUsers: fixture.totalReferralUsers,
    level1Users: fixture.level1Users,
    level2Users: fixture.level2Users,
    level3Users: fixture.level3Users,
    level4Users: fixture.level4Users,
    level5Users: fixture.level5Users,
    level6Users: fixture.level6Users,
    totalCommission: money(fixture.totalCommissionMinor),
    postedCommission: money(fixture.postedCommissionMinor),
    pendingCommission: money(fixture.pendingCommissionMinor),
    levels: ([1, 2, 3, 4, 5, 6] as const).map((level) => ({
      level,
      users:
        level === 1
          ? fixture.level1Users
          : level === 2
            ? fixture.level2Users
            : level === 3
              ? fixture.level3Users
              : level === 4
                ? fixture.level4Users
                : level === 5
                  ? fixture.level5Users
                  : fixture.level6Users,
      commission: money(fixture.levelCommissionMinor[level - 1]!),
    })),
  };
}

export function listReferralUsers(query: ReferralUserListQuery): ReferralUserListResponse {
  const result = queryReferralUsers(users, commissions, query);
  return referralUserListResponseSchema.parse({
    source: "mock",
    generatedAt: revisedAt,
    summary: summaryPayload(),
    agents: agents(),
    items: result.items.map((item) => toListItem(item, result.commissionByUser.get(item.userId) ?? 0)),
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
}

function buildTreeNodes(parentId: string, level: ReferralLevel): ReferralTreeResponse["levels"][number]["nodes"] {
  if (level > 6) return [];
  return childrenOf(users, parentId).map((child) => ({
    userId: child.userId,
    displayName: child.displayName,
    referralCode: child.referralCode,
    status: child.status,
    registeredAt: child.registeredAt,
    directReferrerId: child.directReferrerId,
    directReferrerName: referrerName(child.directReferrerId),
    agentOwnerId: child.agentOwnerId,
    agentOwnerName: child.agentOwnerName,
    referralLevel: level,
    commissionGenerated: money(
      commissions.filter((item) => item.beneficiaryId === child.userId).reduce((sum, item) => sum + item.commissionAmountMinor, 0),
    ),
    children: level < 6 ? buildTreeNodes(child.userId, (level + 1) as ReferralLevel) : [],
  }));
}

function flattenLevel(nodes: ReferralTreeResponse["levels"][number]["nodes"], target: ReferralLevel) {
  const out: ReferralTreeResponse["levels"][number]["nodes"] = [];
  function walk(list: typeof nodes) {
    for (const node of list) {
      if (node.referralLevel === target) out.push({ ...node, children: [] });
      walk(node.children as typeof nodes);
    }
  }
  walk(nodes);
  return out;
}

export function getReferralTree(userId: string): ServiceOk<ReferralTreeResponse> | ServiceError {
  const root = users.find((item) => item.userId === userId);
  if (!root) return { ok: false, code: "NOT_FOUND", message: "That referral user was not found." };
  const nested = buildTreeNodes(userId, 1);
  const levels = ([1, 2, 3, 4, 5, 6] as const).map((level) => ({
    level,
    nodes: flattenLevel(nested, level),
  }));
  return {
    ok: true,
    data: referralTreeResponseSchema.parse({
      source: "mock",
      generatedAt: revisedAt,
      root: {
        userId: root.userId,
        displayName: root.displayName,
        referralCode: root.referralCode,
        directReferrerId: root.directReferrerId,
        directReferrerName: referrerName(root.directReferrerId),
        agentOwnerId: root.agentOwnerId,
        agentOwnerName: root.agentOwnerName,
        registeredAt: root.registeredAt,
        status: root.status,
      },
      levels,
    }),
  };
}

function networkCounts(rootId: string) {
  const nested = buildTreeNodes(rootId, 1);
  const counts = { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0 };
  function walk(nodes: ReturnType<typeof buildTreeNodes>) {
    for (const node of nodes) {
      if (node.referralLevel === 1) counts.level1 += 1;
      if (node.referralLevel === 2) counts.level2 += 1;
      if (node.referralLevel === 3) counts.level3 += 1;
      if (node.referralLevel === 4) counts.level4 += 1;
      if (node.referralLevel === 5) counts.level5 += 1;
      if (node.referralLevel === 6) counts.level6 += 1;
      walk(node.children as ReturnType<typeof buildTreeNodes>);
    }
  }
  walk(nested);
  return counts;
}

export function getUserReferral(userId: string): ServiceOk<UserReferralDetail> | ServiceError {
  const user = users.find((item) => item.userId === userId);
  if (!user) return { ok: false, code: "NOT_FOUND", message: "That referral user was not found." };
  const own = commissions.filter((item) => item.beneficiaryId === userId);
  const byLevel = ([1, 2, 3, 4, 5, 6] as const).map((level) => ({
    level,
    amount: money(own.filter((item) => item.level === level).reduce((sum, item) => sum + item.commissionAmountMinor, 0)),
  }));
  const chain = uplineChain(users, userId);
  return {
    ok: true,
    data: userReferralDetailSchema.parse({
      source: "mock",
      generatedAt: revisedAt,
      userId: user.userId,
      displayName: user.displayName,
      referralCode: user.referralCode,
      directReferrerId: user.directReferrerId,
      directReferrerName: referrerName(user.directReferrerId),
      acquisitionSource: user.acquisitionSource,
      agentOwnerId: user.agentOwnerId,
      agentOwnerName: user.agentOwnerName,
      referralLevel: chain.length === 0 ? null : chain.length,
      network: networkCounts(userId),
      commissions: {
        total: money(own.reduce((sum, item) => sum + item.commissionAmountMinor, 0)),
        pending: money(own.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.commissionAmountMinor, 0)),
        posted: money(own.filter((item) => item.status === "posted").reduce((sum, item) => sum + item.commissionAmountMinor, 0)),
        reversed: money(own.filter((item) => item.status === "reversed").reduce((sum, item) => sum + item.commissionAmountMinor, 0)),
        byLevel,
      },
    }),
  };
}

export function getAgentReferral(agentId: string): ServiceOk<AgentReferralDetail> | ServiceError {
  const owned = users.filter((item) => item.agentOwnerId === agentId);
  if (owned.length === 0) return { ok: false, code: "NOT_FOUND", message: "That agent referral network was not found." };
  const agentName = owned[0]!.agentOwnerName;
  const direct = owned.filter((item) => item.acquisitionSource === "AGENT" || !item.directReferrerId);
  const network = { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0 };
  for (const user of owned) {
    const depth = uplineChain(users, user.userId).length;
    if (depth === 1) network.level1 += 1;
    if (depth === 2) network.level2 += 1;
    if (depth === 3) network.level3 += 1;
    if (depth === 4) network.level4 += 1;
    if (depth === 5) network.level5 += 1;
    if (depth === 6) network.level6 += 1;
  }
  const commissionGenerated = commissions
    .filter((item) => item.agentOwnerId === agentId)
    .reduce((sum, item) => sum + item.commissionAmountMinor, 0);
  return {
    ok: true,
    data: agentReferralDetailSchema.parse({
      source: "mock",
      generatedAt: revisedAt,
      agentId,
      agentName,
      agentReferralCode: `AREF-${agentId.replace("AG-", "")}`,
      directReferrals: direct.length,
      totalDownline: owned.length,
      network,
      commissionGenerated: money(commissionGenerated),
    }),
  };
}

function toCommissionItem(item: CommissionRecord) {
  return {
    id: item.id,
    betId: item.betId,
    betUserId: item.betUserId,
    betUserName: item.betUserName,
    beneficiaryId: item.beneficiaryId,
    beneficiaryName: item.beneficiaryName,
    level: item.level,
    betAmount: money(item.betAmountMinor),
    appliedRatePercent: formatRatePercent(item.appliedRateBps),
    commissionAmount: money(item.commissionAmountMinor),
    status: item.status,
    ledgerTransactionId: item.ledgerTransactionId,
    agentOwnerId: item.agentOwnerId,
    agentOwnerName: item.agentOwnerName,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function listReferralCommissions(query: ReferralCommissionListQuery): ReferralCommissionListResponse {
  const result = queryCommissions(commissions, query);
  const summary = commissionSummaryFixture;
  return referralCommissionListResponseSchema.parse({
    source: "mock",
    generatedAt: revisedAt,
    summary: {
      total: summary.total,
      pending: summary.pending,
      posted: summary.posted,
      reversed: summary.reversed,
      failed: summary.failed,
      pendingAmount: money(summary.pendingAmountMinor),
      postedAmount: money(summary.postedAmountMinor),
    },
    agents: agents(),
    items: result.items.map(toCommissionItem),
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
}

export function getReferralCommission(commissionId: string): ServiceOk<ReferralCommissionDetail> | ServiceError {
  const item = commissions.find((entry) => entry.id === commissionId);
  if (!item) return { ok: false, code: "NOT_FOUND", message: "That commission was not found." };
  const betUser = users.find((user) => user.userId === item.betUserId);
  const current = config.find((entry) => entry.level === item.level);
  return {
    ok: true,
    data: referralCommissionDetailSchema.parse({
      source: "mock",
      generatedAt: revisedAt,
      commission: toCommissionItem(item),
      currentRatePercent: formatRatePercent(current?.rateBps ?? 0),
      directReferrerId: betUser?.directReferrerId ?? null,
      directReferrerName: referrerName(betUser?.directReferrerId ?? null),
    }),
  };
}

export function getCommissionConfig(): CommissionConfigResponse {
  return commissionConfigResponseSchema.parse({
    source: "mock",
    generatedAt: revisedAt,
    items: config.map((item) => ({
      level: item.level,
      ratePercent: formatRatePercent(item.rateBps),
      status: item.status,
      effectiveFrom: item.effectiveFrom,
      updatedAt: item.updatedAt,
      updatedBy: item.updatedBy,
    })),
  });
}

export function updateCommissionConfig(
  change: CommissionConfigUpdate,
): ServiceOk<CommissionConfigResponse> | ServiceError {
  const rateBps = parseRatePercentToBps(change.commissionPercentage);
  if (rateBps === null) {
    return { ok: false, code: "VALIDATION_ERROR", message: "Enter a valid commission percentage." };
  }
  const index = config.findIndex((item) => item.level === change.level);
  if (index < 0) return { ok: false, code: "NOT_FOUND", message: "That commission level was not found." };
  config[index] = {
    ...config[index]!,
    rateBps,
    updatedAt: REFERRAL_AS_OF,
    updatedBy: "ops.admin",
  };
  revisedAt = REFERRAL_AS_OF;
  return { ok: true, data: getCommissionConfig() };
}

export function getReferralReports(query: ReferralReportQuery): ReferralReportResponse {
  let rows = [...commissions];
  if (query.agent !== "all") rows = rows.filter((item) => item.agentOwnerId === query.agent);
  if (query.level !== "all") rows = rows.filter((item) => String(item.level) === query.level);
  if (query.status !== "all") rows = rows.filter((item) => item.status === query.status);

  const byLevel = ([1, 2, 3, 4, 5, 6] as const).map((level) => {
    const subset = rows.filter((item) => item.level === level);
    return {
      level,
      commissions: subset.length,
      amount: money(subset.reduce((sum, item) => sum + item.commissionAmountMinor, 0)),
    };
  });

  const statuses = ["pending", "posted", "reversed", "failed"] as const;
  const byStatus = statuses.map((status) => {
    const subset = rows.filter((item) => item.status === status);
    return {
      status,
      count: subset.length,
      amount: money(subset.reduce((sum, item) => sum + item.commissionAmountMinor, 0)),
    };
  });

  return referralReportResponseSchema.parse({
    source: "mock",
    generatedAt: revisedAt,
    filters: {
      created: query.created,
      agent: query.agent,
      level: query.level,
      status: query.status,
    },
    byLevel,
    byStatus,
    registrationStats: {
      agentAcquired: users.filter((item) => item.acquisitionSource === "AGENT").length,
      userReferral: users.filter((item) => item.acquisitionSource === "USER_REFERRAL").length,
    },
    totals: {
      commissionAmount: money(rows.reduce((sum, item) => sum + item.commissionAmountMinor, 0)),
      postedAmount: money(rows.filter((item) => item.status === "posted").reduce((sum, item) => sum + item.commissionAmountMinor, 0)),
      pendingAmount: money(rows.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.commissionAmountMinor, 0)),
    },
  });
}

export function referralSearchHits(): SearchResult[] {
  const userHits = users.map((item) => ({
    id: item.referralCode,
    type: "referral" as const,
    title: `${item.displayName} · ${item.referralCode}`,
    subtitle: `User ${item.userId} · ${item.acquisitionSource}`,
    href: `/referrals/tree?userId=${item.userId}`,
  }));
  const commissionHits = commissions.slice(0, 12).map((item) => ({
    id: item.id,
    type: "commission" as const,
    title: `${item.beneficiaryName} · L${item.level}`,
    subtitle: `${item.id} · ${item.betId}`,
    href: `/referrals/commissions?q=${encodeURIComponent(item.id)}`,
  }));
  return [...userHits, ...commissionHits];
}
