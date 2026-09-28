import { expect, test } from "vitest";
import { PERMISSIONS, can } from "@/config/permissions";
import { formatMoney } from "@/lib/format";
import {
  commissionConfigUpdateSchema,
  commissionIdSchema,
  referralCommissionListQuerySchema,
  referralUserListQuerySchema,
} from "@/lib/validation/referrals";
import {
  formatRatePercent,
  parseRatePercentToBps,
  referralSummaryFixture,
  seedCommissionConfig,
  seedCommissions,
  seedReferralUsers,
} from "@/mocks/data/referrals";
import { childrenOf, levelUnder, queryCommissions, queryReferralUsers, uplineChain } from "@/mocks/referral-query";

function users(overrides: Record<string, unknown> = {}) {
  return queryReferralUsers(seedReferralUsers, seedCommissions, referralUserListQuerySchema.parse(overrides));
}

function commissions(overrides: Record<string, unknown> = {}) {
  return queryCommissions(seedCommissions, referralCommissionListQuerySchema.parse(overrides));
}

test("referral summary fixture is an explicit six-level snapshot", () => {
  expect(referralSummaryFixture.level1Users).toBe(8);
  expect(referralSummaryFixture.levelCommissionMinor).toHaveLength(6);
  expect(formatMoney({ amountMinor: referralSummaryFixture.totalCommissionMinor, currency: "INR" })).toBe(
    "₹4,85,000.00",
  );
  expect(seedCommissionConfig).toHaveLength(6);
  expect(seedCommissionConfig.some((item) => (item.level as number) === 7)).toBe(false);
});

test("six-level upline under Aditya reaches Meera without a seventh level", () => {
  expect(levelUnder(seedReferralUsers, "27411", "33108")).toBe(1);
  expect(levelUnder(seedReferralUsers, "27411", "55201")).toBe(6);
  expect(uplineChain(seedReferralUsers, "55201").map((item) => item.userId)).toEqual([
    "22814",
    "44190",
    "61003",
    "19022",
    "33108",
    "27411",
  ]);
  expect(childrenOf(seedReferralUsers, "27411").some((item) => item.userId === "33108")).toBe(true);
});

test("referrer and agent owner remain distinct fields", () => {
  const anika = seedReferralUsers.find((item) => item.userId === "44190");
  expect(anika?.directReferrerId).toBe("61003");
  expect(anika?.agentOwnerId).toBe("AG-1214");
  expect(anika?.directReferrerId).not.toBe(anika?.agentOwnerId);
});

test("referral user search, filters, and pagination stay on the service query", () => {
  expect(users({ q: "REF-ADITYA" }).items.map((item) => item.userId)).toEqual(["27411"]);
  expect(users({ q: "Sana" }).total).toBeGreaterThan(0);
  expect(users({ source: "AGENT" }).items.every((item) => item.acquisitionSource === "AGENT")).toBe(true);
  expect(users({ level: "1" }).items.every((item) => uplineChain(seedReferralUsers, item.userId).length === 1)).toBe(
    true,
  );
  expect(users({ agent: "AG-1042" }).items.every((item) => item.agentOwnerId === "AG-1042")).toBe(true);
  const page = users({ page: 2, pageSize: 10 });
  expect(page.items.length).toBeGreaterThan(0);
  expect(page.total).toBe(seedReferralUsers.length);
});

test("commission history preserves historical applied rates separately from current config", () => {
  const level2 = seedCommissions.find((item) => item.id === "RC-70002");
  expect(level2?.appliedRateBps).toBe(50);
  expect(formatRatePercent(level2!.appliedRateBps)).toBe("0.50");
  const currentLevel2 = seedCommissionConfig.find((item) => item.level === 2);
  expect(currentLevel2?.rateBps).toBe(75);
  expect(formatRatePercent(currentLevel2!.rateBps)).toBe("0.75");
  expect(level2?.appliedRateBps).not.toBe(currentLevel2?.rateBps);
});

test("commission filters, sorting, and pagination stay on the service query", () => {
  expect(commissions({ q: "RC-70001" }).items.map((item) => item.id)).toEqual(["RC-70001"]);
  expect(commissions({ level: "6" }).items.every((item) => item.level === 6)).toBe(true);
  expect(commissions({ status: "pending" }).items.every((item) => item.status === "pending")).toBe(true);
  expect(commissions({ betId: "BET-88421" }).total).toBe(6);
  const sorted = commissions({ sort: "commissionAmount", direction: "desc" });
  expect(sorted.items[0]?.commissionAmountMinor ?? 0).toBeGreaterThanOrEqual(
    sorted.items[1]?.commissionAmountMinor ?? 0,
  );
  expect(commissionIdSchema.safeParse("RC-70001").success).toBe(true);
  expect(commissionIdSchema.safeParse("bad").success).toBe(false);
});

test("commission config update validation and permissions", () => {
  expect(commissionConfigUpdateSchema.safeParse({ level: 1, commissionPercentage: "1.50" }).success).toBe(true);
  expect(commissionConfigUpdateSchema.safeParse({ level: 7, commissionPercentage: "1.00" }).success).toBe(false);
  expect(commissionConfigUpdateSchema.safeParse({ level: 2, commissionPercentage: "-1" }).success).toBe(false);
  expect(parseRatePercentToBps("1.50")).toBe(150);
  expect(can(["REFERRAL_VIEW"], PERMISSIONS.REFERRAL_CONFIG_UPDATE)).toBe(false);
  expect(can([PERMISSIONS.REFERRAL_CONFIG_UPDATE], PERMISSIONS.REFERRAL_CONFIG_UPDATE)).toBe(true);
});
