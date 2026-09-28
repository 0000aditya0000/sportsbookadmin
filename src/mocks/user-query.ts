import { USER_AS_OF, type ResumeStatus, type UserRecord, type UserSessionRecord, type UserStatus } from "@/mocks/data/users";
import type { Money } from "@/lib/format";
import type { UserListQuery } from "@/lib/validation/users";

const AS_OF_MS = Date.parse(USER_AS_OF);
const DAY_MS = 86_400_000;
const TEN_THOUSAND_MINOR = 1_000_000;
const ONE_LAKH_MINOR = 10_000_000;

export type UserAction = "suspend" | "activate" | "ban" | "unlock";

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `+91 ••••• ${digits.slice(-4)}`;
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "••••";
  return `${local.slice(0, 2)}••••@${domain}`;
}

export function money(amountMinor: number): Money {
  return { amountMinor, currency: "INR" };
}

export function nextUserStatus(
  current: UserStatus,
  action: UserAction,
  resumeStatus: ResumeStatus | null,
): UserStatus | null {
  if (action === "suspend" && current === "active") return "suspended";
  if (action === "activate" && current === "suspended") return "active";
  if (action === "ban" && (current === "active" || current === "suspended")) return "banned";
  if (action === "unlock" && current === "locked" && resumeStatus) return resumeStatus;
  return null;
}

export function summarizeUsers(records: readonly UserRecord[]) {
  let balanceMinor = 0;
  let active = 0;
  let suspended = 0;
  let banned = 0;
  let locked = 0;
  let online = 0;
  for (const record of records) {
    balanceMinor += record.balanceMinor;
    if (record.status === "active") active += 1;
    else if (record.status === "suspended") suspended += 1;
    else if (record.status === "banned") banned += 1;
    else locked += 1;
    if (record.hasActiveSession) online += 1;
  }
  return {
    total: records.length,
    active,
    suspended,
    banned,
    locked,
    online,
    balanceMinor,
  };
}

function createdCutoff(created: UserListQuery["created"]): number | null {
  if (created === "all") return null;
  const days = created === "7d" ? 7 : created === "30d" ? 30 : 90;
  return AS_OF_MS - days * DAY_MS;
}

function matches(record: UserRecord, query: UserListQuery): boolean {
  if (query.status !== "all" && record.status !== query.status) return false;
  if (query.agent !== "all" && record.agentId !== query.agent) return false;
  if (query.activity === "online" && !record.hasActiveSession) return false;
  if (query.activity === "quiet" && record.hasActiveSession) return false;
  if (query.betting === "open" && record.openBets <= 0) return false;
  if (query.betting === "settled" && !(record.openBets === 0 && record.totalBets > 0)) return false;
  if (query.betting === "none" && record.totalBets !== 0) return false;
  const cutoff = createdCutoff(query.created);
  if (cutoff !== null && Date.parse(record.createdAt) < cutoff) return false;
  if (query.balance === "under_10k" && record.balanceMinor >= TEN_THOUSAND_MINOR) return false;
  if (
    query.balance === "10k_1l" &&
    (record.balanceMinor < TEN_THOUSAND_MINOR || record.balanceMinor >= ONE_LAKH_MINOR)
  ) {
    return false;
  }
  if (query.balance === "over_1l" && record.balanceMinor < ONE_LAKH_MINOR) return false;
  const needle = query.q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    record.id,
    record.displayName,
    record.username,
    record.phone,
    record.email,
    record.agentId,
    record.agentName,
    `USR-${record.id}`,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

function compare(left: UserRecord, right: UserRecord, query: UserListQuery): number {
  const direction = query.direction === "asc" ? 1 : -1;
  let delta = 0;
  switch (query.sort) {
    case "name":
      delta = left.displayName.localeCompare(right.displayName);
      break;
    case "id":
      delta = Number(left.id) - Number(right.id);
      break;
    case "agent":
      delta = left.agentName.localeCompare(right.agentName) || left.agentId.localeCompare(right.agentId);
      break;
    case "balance":
      delta = left.balanceMinor - right.balanceMinor;
      break;
    case "openBets":
      delta = left.openBets - right.openBets;
      break;
    case "turnover":
      delta = left.turnoverMinor - right.turnoverMinor;
      break;
    case "lastLogin": {
      const leftLogin = left.lastLoginAt ? Date.parse(left.lastLoginAt) : Number.NEGATIVE_INFINITY;
      const rightLogin = right.lastLoginAt ? Date.parse(right.lastLoginAt) : Number.NEGATIVE_INFINITY;
      delta = leftLogin - rightLogin;
      break;
    }
    case "createdAt":
      delta = Date.parse(left.createdAt) - Date.parse(right.createdAt);
      break;
    default: {
      const unreachable: never = query.sort;
      return unreachable;
    }
  }
  if (delta === 0) delta = left.id.localeCompare(right.id);
  return delta * direction;
}

export function queryUsers(records: readonly UserRecord[], query: UserListQuery) {
  const filtered = records.filter((record) => matches(record, query));
  const sorted = [...filtered].sort((left, right) => compare(left, right, query));
  const start = (query.page - 1) * query.pageSize;
  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
  };
}

export function activeSessionCount(sessions: readonly UserSessionRecord[], userId: string): number {
  return sessions.filter((session) => session.userId === userId && session.status === "active").length;
}

export function revokeSession(
  sessions: readonly UserSessionRecord[],
  userId: string,
  sessionId: string,
): { ok: true; sessions: UserSessionRecord[] } | { ok: false; code: "NOT_FOUND" | "CONFLICT"; message: string } {
  const index = sessions.findIndex((session) => session.id === sessionId && session.userId === userId);
  const current = sessions[index];
  if (!current) return { ok: false, code: "NOT_FOUND", message: "That session was not found." };
  if (current.status !== "active") {
    return { ok: false, code: "CONFLICT", message: "Only an active session can be revoked." };
  }
  const next = sessions.map((session, position) =>
    position === index ? { ...session, status: "revoked" as const } : session,
  );
  return { ok: true, sessions: next };
}
