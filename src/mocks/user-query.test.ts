import { expect, test } from "vitest";
import { buildSeedSessions, buildSeedUsers } from "@/mocks/data/users";
import {
  activeSessionCount,
  maskEmail,
  maskPhone,
  nextUserStatus,
  queryUsers,
  revokeSession,
  summarizeUsers,
} from "@/mocks/user-query";
import { userListQuerySchema } from "@/lib/validation/users";

const users = buildSeedUsers();
const sessions = buildSeedSessions(users);

function query(overrides: Record<string, unknown> = {}) {
  return userListQuerySchema.parse(overrides);
}

test("masks phone and email without reconstructing the hidden part", () => {
  expect(maskPhone("+91 98000 27411")).toBe("+91 ••••• 7411");
  expect(maskEmail("aditya.sharma@meridian.local")).toBe("ad••••@meridian.local");
  expect(maskEmail("aditya.sharma@meridian.local")).not.toContain("sharma");
});

test("searches by id, name, phone, email, and agent without returning the full book", () => {
  const byPhone = queryUsers(users, query({ q: "98000 27411" }));
  expect(byPhone.items.map((item) => item.id)).toEqual(["27411"]);
  expect(byPhone.total).toBe(1);

  const byName = queryUsers(users, query({ q: "aditya" }));
  expect(byName.items[0]?.displayName).toBe("Aditya Sharma");

  const byEmail = queryUsers(users, query({ q: "kabir.menon@meridian.local" }));
  expect(byEmail.items.map((item) => item.id)).toEqual(["19022"]);

  const byAgent = queryUsers(users, query({ q: "east desk", pageSize: 50 }));
  expect(byAgent.items.every((item) => item.agentId === "AG-1042")).toBe(true);
  expect(byAgent.items.some((item) => item.id === "27411")).toBe(true);
});

test("filters status, agent, balance, activity, betting, and registration date", () => {
  const banned = queryUsers(users, query({ status: "banned", pageSize: 50 }));
  expect(banned.items.every((item) => item.status === "banned")).toBe(true);
  expect(banned.items.some((item) => item.id === "55201")).toBe(true);

  const east = queryUsers(users, query({ agent: "AG-1042", pageSize: 50 }));
  expect(east.items.every((item) => item.agentId === "AG-1042")).toBe(true);
  expect(east.items.some((item) => item.id === "19022")).toBe(false);

  const highBalance = queryUsers(users, query({ balance: "over_1l" }));
  expect(highBalance.items.map((item) => item.id)).toContain("61003");
  expect(highBalance.items.map((item) => item.id)).not.toContain("27411");

  const online = queryUsers(users, query({ activity: "online", pageSize: 50 }));
  expect(online.items.every((item) => item.hasActiveSession)).toBe(true);

  const noBets = queryUsers(users, query({ betting: "none", pageSize: 50 }));
  expect(noBets.items.some((item) => item.id === "61002")).toBe(true);

  const recent = queryUsers(users, query({ created: "7d", pageSize: 50 }));
  expect(recent.items.some((item) => item.id === "61002")).toBe(true);
  expect(recent.items.some((item) => item.id === "27411")).toBe(false);
});

test("sorts and paginates on the server-shaped page", () => {
  const first = queryUsers(users, query({ sort: "turnover", direction: "desc", page: 1, pageSize: 10 }));
  expect(first.items).toHaveLength(10);
  expect(first.total).toBe(users.length);
  expect(first.items[0]?.id).toBe("61003");
  const second = queryUsers(users, query({ sort: "turnover", direction: "desc", page: 2, pageSize: 10 }));
  expect(second.items).toHaveLength(10);
  expect(second.items[0]?.id).not.toBe(first.items[0]?.id);
});

test("keeps suspend, activate, ban, and unlock as distinct transitions", () => {
  expect(nextUserStatus("active", "suspend", null)).toBe("suspended");
  expect(nextUserStatus("suspended", "activate", null)).toBe("active");
  expect(nextUserStatus("active", "ban", null)).toBe("banned");
  expect(nextUserStatus("banned", "activate", null)).toBeNull();
  expect(nextUserStatus("locked", "activate", "suspended")).toBeNull();
  expect(nextUserStatus("locked", "unlock", "suspended")).toBe("suspended");
  expect(nextUserStatus("locked", "unlock", "active")).toBe("active");
  expect(nextUserStatus("locked", "ban", null)).toBeNull();
});

test("revokes only the active session and keeps a single active session per user", () => {
  for (const user of users) {
    expect(activeSessionCount(sessions, user.id)).toBeLessThanOrEqual(1);
    expect(user.hasActiveSession).toBe(activeSessionCount(sessions, user.id) === 1);
  }
  const revoked = revokeSession(sessions, "27411", "SES-27411");
  expect(revoked.ok).toBe(true);
  if (!revoked.ok) return;
  expect(revoked.sessions.find((session) => session.id === "SES-27411")?.status).toBe("revoked");
  expect(activeSessionCount(revoked.sessions, "27411")).toBe(0);
  expect(revokeSession(revoked.sessions, "27411", "SES-27411").ok).toBe(false);
});

test("summarizes the book with integer paise", () => {
  const summary = summarizeUsers(users);
  expect(summary.total).toBe(users.length);
  expect(summary.active + summary.suspended + summary.banned + summary.locked).toBe(summary.total);
  expect(Number.isInteger(summary.balanceMinor)).toBe(true);
  expect(summary.balanceMinor).toBe(users.reduce((total, user) => total + user.balanceMinor, 0));
});
