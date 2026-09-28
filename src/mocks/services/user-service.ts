import "server-only";

import { randomBytes } from "node:crypto";
import type { SearchResult } from "@/lib/validation/search";
import {
  userDetailSchema,
  userListResponseSchema,
  userSessionRevokeResponseSchema,
  userStatusResponseSchema,
  type UserDetail,
  type UserListQuery,
  type UserListResponse,
  type UserStatusChange,
} from "@/lib/validation/users";
import {
  buildSeedSessions,
  buildSeedUsers,
  seedActivity,
  seedBets,
  seedRisk,
  seedTransactions,
  USER_AS_OF,
  type UserActivityRecord,
  type UserBetRecord,
  type UserRecord,
  type UserRiskRecord,
  type UserSessionRecord,
  type UserTransactionRecord,
} from "@/mocks/data/users";
import { ownerWalletBalances } from "@/mocks/services/wallet-service";
import {
  activeSessionCount,
  maskEmail,
  maskPhone,
  money,
  nextUserStatus,
  queryUsers,
  revokeSession,
  summarizeUsers,
} from "@/mocks/user-query";

type ServiceError = { ok: false; code: "NOT_FOUND" | "CONFLICT"; message: string };
type ServiceOk<T> = { ok: true; data: T };

function cloneUser(record: UserRecord): UserRecord {
  return { ...record };
}

const seedUsers = buildSeedUsers();
const users: UserRecord[] = seedUsers.map(cloneUser);
let sessions: UserSessionRecord[] = buildSeedSessions(seedUsers).map((session) => ({ ...session }));
const bets: UserBetRecord[] = seedBets.map((bet) => ({ ...bet }));
const transactions: UserTransactionRecord[] = seedTransactions.map((transaction) => ({ ...transaction }));
const activity: UserActivityRecord[] = seedActivity.map((event) => ({ ...event }));
const risk: UserRiskRecord[] = seedRisk.map((item) => ({ ...item, largeBetIds: [...item.largeBetIds], flags: [...item.flags] }));
let revisedAt = USER_AS_OF;

function toListItem(record: UserRecord) {
  const active = sessions.find((session) => session.userId === record.id && session.status === "active");
  return {
    id: record.id,
    displayName: record.displayName,
    username: record.username,
    phone: maskPhone(record.phone),
    email: maskEmail(record.email),
    agentId: record.agentId,
    agentName: record.agentName,
    status: record.status,
    balance: money(record.balanceMinor),
    held: money(record.heldMinor),
    openBets: record.openBets,
    totalBets: record.totalBets,
    turnover: money(record.turnoverMinor),
    ggr: money(record.ggrMinor),
    lastLoginAt: record.lastLoginAt,
    createdAt: record.createdAt,
    hasActiveSession: record.hasActiveSession,
    activeSessionId: active?.id ?? null,
  };
}

function activityDetail(event: UserActivityRecord): string {
  const parts = [event.action];
  if (event.actor) parts.push(event.actor);
  if (event.reference) parts.push(event.reference);
  return parts.join(" · ");
}

function riskView(userId: string) {
  const item = risk.find((entry) => entry.userId === userId);
  if (!item) {
    return {
      available: false,
      message: "Risk figures are not supplied for this user.",
      exposure: null,
      openBets: null,
      largeBetIds: [],
      flags: [],
      maxStake: null,
    };
  }
  return {
    available: true,
    message: "Development fixture. The console does not calculate exposure.",
    exposure: money(item.exposureMinor),
    openBets: item.openBets,
    largeBetIds: item.largeBetIds,
    flags: item.flags,
    maxStake: money(item.maxStakeMinor),
  };
}

function agentOptions() {
  const names = new Map<string, string>();
  for (const user of users) names.set(user.agentId, user.agentName);
  return [...names.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function listUserRecords(query: UserListQuery): UserListResponse {
  const summary = summarizeUsers(users);
  const result = queryUsers(users, query);
  return userListResponseSchema.parse({
    source: "mock",
    generatedAt: revisedAt,
    summary: {
      total: summary.total,
      active: summary.active,
      suspended: summary.suspended,
      banned: summary.banned,
      locked: summary.locked,
      online: summary.online,
      balance: money(summary.balanceMinor),
    },
    agents: agentOptions(),
    items: result.items.map(toListItem),
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
}

export function getUserRecord(userId: string): ServiceOk<UserDetail> | ServiceError {
  const record = users.find((user) => user.id === userId);
  if (!record) return { ok: false, code: "NOT_FOUND", message: "That user was not found." };
  const userSessions = sessions
    .filter((session) => session.userId === userId)
    .sort((left, right) => Date.parse(right.lastActiveAt) - Date.parse(left.lastActiveAt));
  const userBets = bets
    .filter((bet) => bet.userId === userId)
    .sort((left, right) => Date.parse(right.placedAt) - Date.parse(left.placedAt));
  const userTransactions = transactions
    .filter((transaction) => transaction.userId === userId)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  const events = activity.filter((event) => event.userId === userId);
  if (events.length === 0) {
    events.push({
      id: `ACT-${userId}-OPENED`,
      userId,
      action: "USER_CREATED",
      title: "Account opened",
      at: record.createdAt,
      actor: null,
      reference: null,
    });
  }
  events.sort((left, right) => Date.parse(right.at) - Date.parse(left.at));

  return {
    ok: true,
    data: userDetailSchema.parse({
      source: "mock",
      generatedAt: revisedAt,
      user: toListItem(record),
      wallet: (() => {
        const balances = ownerWalletBalances("user", record.id);
        return {
          available: money(balances?.availableMinor ?? record.balanceMinor),
          held: money(balances?.heldMinor ?? record.heldMinor),
        };
      })(),
      bets: userBets.map((bet) => ({
        id: bet.id,
        event: bet.event,
        market: bet.market,
        selection: bet.selection,
        stake: money(bet.stakeMinor),
        odds: bet.odds,
        potentialPayout: money(bet.potentialPayoutMinor),
        status: bet.status,
        settlement: bet.settlement,
        placedAt: bet.placedAt,
      })),
      transactions: userTransactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        direction: transaction.direction,
        amount: money(transaction.amountMinor),
        status: transaction.status,
        reference: transaction.reference,
        createdAt: transaction.createdAt,
      })),
      sessions: userSessions.map((session) => ({
        id: session.id,
        device: session.device,
        browser: session.browser,
        os: session.os,
        ip: session.ip,
        loginAt: session.loginAt,
        lastActiveAt: session.lastActiveAt,
        expiresAt: session.expiresAt,
        status: session.status,
      })),
      activity: events.map((event) => ({
        id: event.id,
        action: event.action,
        title: event.title,
        detail: activityDetail(event),
        at: event.at,
      })),
      risk: riskView(userId),
    }),
  };
}

const statusCopy: Record<UserStatusChange["action"], { action: string; title: string }> = {
  suspend: { action: "USER_SUSPENDED", title: "User suspended" },
  activate: { action: "USER_ACTIVATED", title: "User activated" },
  ban: { action: "USER_BANNED", title: "User banned" },
  unlock: { action: "USER_UNLOCKED", title: "User unlocked" },
};

export function changeUserStatus(
  userId: string,
  change: UserStatusChange,
  actor: string,
): ServiceOk<ReturnType<typeof userStatusResponseSchema.parse>> | ServiceError {
  const record = users.find((user) => user.id === userId);
  if (!record) return { ok: false, code: "NOT_FOUND", message: "That user was not found." };
  const next = nextUserStatus(record.status, change.action, record.resumeStatus);
  if (!next) {
    return { ok: false, code: "CONFLICT", message: "That status change is not available for this account." };
  }
  record.status = next;
  if (change.action === "unlock") record.resumeStatus = null;
  revisedAt = new Date().toISOString();
  const copy = statusCopy[change.action];
  activity.unshift({
    id: `ACT-${randomBytes(4).toString("hex")}`,
    userId,
    action: copy.action,
    title: copy.title,
    at: revisedAt,
    actor,
    reference: change.reason ? change.reason : null,
  });
  return { ok: true, data: userStatusResponseSchema.parse({ user: toListItem(record) }) };
}

export function revokeUserSession(
  userId: string,
  sessionId: string,
  actor: string,
): ServiceOk<ReturnType<typeof userSessionRevokeResponseSchema.parse>> | ServiceError {
  const record = users.find((user) => user.id === userId);
  if (!record) return { ok: false, code: "NOT_FOUND", message: "That user was not found." };
  const result = revokeSession(sessions, userId, sessionId);
  if (!result.ok) return result;
  sessions = result.sessions;
  record.hasActiveSession = activeSessionCount(sessions, userId) > 0;
  revisedAt = new Date().toISOString();
  const session = sessions.find((item) => item.id === sessionId && item.userId === userId);
  if (!session) return { ok: false, code: "NOT_FOUND", message: "That session was not found." };
  activity.unshift({
    id: `ACT-${randomBytes(4).toString("hex")}`,
    userId,
    action: "ADMIN_LOGOUT_USER",
    title: "Session revoked",
    at: revisedAt,
    actor,
    reference: session.id,
  });
  return {
    ok: true,
    data: userSessionRevokeResponseSchema.parse({
      userId,
      session: {
        id: session.id,
        device: session.device,
        browser: session.browser,
        os: session.os,
        ip: session.ip,
        loginAt: session.loginAt,
        lastActiveAt: session.lastActiveAt,
        expiresAt: session.expiresAt,
        status: session.status,
      },
    }),
  };
}

export function userSearchHits(): SearchResult[] {
  return users.map((user) => ({
    id: user.id,
    type: "user" as const,
    title: user.displayName,
    subtitle: `${user.status} · ${user.agentName} · USR-${user.id}`,
    href: `/users/${user.id}`,
  }));
}
