import { expect, test } from "vitest";
import { PERMISSIONS, can } from "@/config/permissions";
import { formatMoney } from "@/lib/format";
import { walletIdSchema, walletListQuerySchema } from "@/lib/validation/wallet";
import { seedAgents } from "@/mocks/data/agents";
import { buildSeedUsers } from "@/mocks/data/users";
import {
  buildWalletAccounts,
  findWalletBalances,
  walletSummaryFixture,
} from "@/mocks/data/wallet";
import { queryWallets } from "@/mocks/wallet-query";

const accounts = buildWalletAccounts(buildSeedUsers(), seedAgents);

function wallets(overrides: Record<string, unknown> = {}) {
  return queryWallets(accounts, walletListQuerySchema.parse(overrides));
}

test("wallet summary fixture is an explicit snapshot", () => {
  expect(walletSummaryFixture.totalBalanceMinor).toBe(820_500_000);
  expect(walletSummaryFixture.availableBalanceMinor).toBe(542_000_000);
  expect(walletSummaryFixture.heldBalanceMinor).toBe(81_500_000);
  expect(walletSummaryFixture.walletLiabilityMinor).toBe(623_500_000);
  expect(formatMoney({ amountMinor: walletSummaryFixture.totalBalanceMinor, currency: "INR" })).toBe(
    "₹82,05,000.00",
  );
});

test("wallet book includes user, agent, and system accounts", () => {
  expect(accounts.length).toBeGreaterThanOrEqual(30);
  expect(accounts.some((account) => account.ownerType === "user")).toBe(true);
  expect(accounts.some((account) => account.ownerType === "agent")).toBe(true);
  expect(accounts.some((account) => account.ownerType === "system")).toBe(true);
  expect(accounts.find((account) => account.walletId === "WLT-USER-27411")?.availableMinor).toBe(1_245_000);
  expect(accounts.find((account) => account.walletId === "WLT-AGENT-AG-1042")?.availableMinor).toBe(184_000_000);
});

test("wallet search, filters, sorting, and pagination stay on the service query", () => {
  expect(wallets({ q: "WLT-USER-27411" }).items.map((item) => item.walletId)).toEqual(["WLT-USER-27411"]);
  expect(wallets({ q: "East Desk" }).total).toBeGreaterThan(0);
  expect(wallets({ type: "user", agent: "AG-1042" }).items.every((item) => item.agentId === "AG-1042")).toBe(true);
  expect(wallets({ status: "frozen" }).items.every((item) => item.status === "frozen")).toBe(true);
  expect(wallets({ balance: "negative" }).items.every((item) => item.totalMinor < 0)).toBe(true);
  expect(wallets({ balance: "zero" }).items.every((item) => item.totalMinor === 0)).toBe(true);
  expect(wallets({ activity: "today" }).total).toBeGreaterThan(0);
  expect(wallets({ sort: "availableBalance", direction: "desc" }).items[0]?.availableMinor).toBeGreaterThanOrEqual(
    wallets({ sort: "availableBalance", direction: "desc" }).items[1]?.availableMinor ?? 0,
  );
  const page = wallets({ page: 2, pageSize: 10 });
  expect(page.items).toHaveLength(10);
  expect(page.total).toBe(accounts.length);
});

test("owner wallet balances are shared and money edge cases display correctly", () => {
  const aditya = findWalletBalances(accounts, "user", "27411");
  expect(aditya?.walletId).toBe("WLT-USER-27411");
  expect(aditya?.availableMinor).toBe(1_245_000);
  expect(formatMoney({ amountMinor: 0, currency: "INR" })).toBe("₹0.00");
  expect(formatMoney({ amountMinor: -1_250_000, currency: "INR" })).toBe("-₹12,500.00");
  expect(walletIdSchema.safeParse("WLT-USER-27411").success).toBe(true);
  expect(walletIdSchema.safeParse("bad").success).toBe(false);
  expect(can(["DASHBOARD_VIEW"], PERMISSIONS.WALLET_VIEW)).toBe(false);
  expect(walletListQuerySchema.parse({})).toMatchObject({
    page: 1,
    pageSize: 10,
    sort: "availableBalance",
    direction: "desc",
  });
});
