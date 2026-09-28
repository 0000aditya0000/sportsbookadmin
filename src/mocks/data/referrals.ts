export const REFERRAL_AS_OF = "2026-09-28T08:15:00.000Z";

export type ReferralLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type AcquisitionSource = "AGENT" | "USER_REFERRAL";
export type CommissionStatus = "pending" | "posted" | "reversed" | "failed";
export type ReferralUserStatus = "active" | "suspended" | "banned" | "locked";

export type ReferralUserRecord = {
  userId: string;
  displayName: string;
  referralCode: string;
  /** Immediate parent in the referral graph. Null when acquired by agent without a user referrer. */
  directReferrerId: string | null;
  agentOwnerId: string;
  agentOwnerName: string;
  acquisitionSource: AcquisitionSource;
  registeredAt: string;
  status: ReferralUserStatus;
  phone: string;
};

export type CommissionConfigRecord = {
  level: ReferralLevel;
  rateBps: number;
  status: "active" | "inactive";
  effectiveFrom: string;
  updatedAt: string;
  updatedBy: string;
};

export type CommissionRecord = {
  id: string;
  betId: string;
  betUserId: string;
  betUserName: string;
  beneficiaryId: string;
  beneficiaryName: string;
  level: ReferralLevel;
  betAmountMinor: number;
  /** Historical applied rate in basis points. Must not be rewritten when config changes. */
  appliedRateBps: number;
  commissionAmountMinor: number;
  status: CommissionStatus;
  ledgerTransactionId: string | null;
  agentOwnerId: string;
  agentOwnerName: string;
  createdAt: string;
  updatedAt: string;
};

function rupees(amount: number): number {
  if (!Number.isInteger(amount)) throw new Error("Fixture amounts must be integer rupees.");
  return amount * 100;
}

/** rateBps 100 = 1.00% */
export function formatRatePercent(rateBps: number): string {
  const major = Math.trunc(rateBps / 100);
  const minor = String(Math.abs(rateBps % 100)).padStart(2, "0");
  return `${major}.${minor}`;
}

export function parseRatePercentToBps(value: string): number | null {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return null;
  const [whole, fraction = ""] = value.trim().split(".");
  const padded = `${fraction}00`.slice(0, 2);
  const bps = Number(whole) * 100 + Number(padded);
  if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) return null;
  return bps;
}

/**
 * Canonical six-level chain (user referral):
 * 27411 (Aditya) → 33108 (Sana) → 19022 (Kabir) → 61003 (Arjun) → 44190 (Anika) → 22814 (Rohan) → 55201 (Meera)
 * Levels under Aditya for Meera's bet: Rohan L1 … Aditya L6.
 */
export const seedReferralUsers: ReferralUserRecord[] = [
  {
    userId: "27411",
    displayName: "Aditya Sharma",
    referralCode: "REF-ADITYA",
    directReferrerId: null,
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    acquisitionSource: "AGENT",
    registeredAt: "2026-07-01T10:00:00.000Z",
    status: "active",
    phone: "+91 98000 27411",
  },
  {
    userId: "33108",
    displayName: "Sana Qureshi",
    referralCode: "REF-SANA",
    directReferrerId: "27411",
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    acquisitionSource: "USER_REFERRAL",
    registeredAt: "2026-07-12T11:00:00.000Z",
    status: "active",
    phone: "+91 98000 33108",
  },
  {
    userId: "19022",
    displayName: "Kabir Menon",
    referralCode: "REF-KABIR",
    directReferrerId: "33108",
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    acquisitionSource: "USER_REFERRAL",
    registeredAt: "2026-07-20T09:30:00.000Z",
    status: "active",
    phone: "+91 98000 19022",
  },
  {
    userId: "61003",
    displayName: "Arjun Sethi",
    referralCode: "REF-ARJUN",
    directReferrerId: "19022",
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    acquisitionSource: "USER_REFERRAL",
    registeredAt: "2026-08-02T14:00:00.000Z",
    status: "active",
    phone: "+91 98000 61003",
  },
  {
    userId: "44190",
    displayName: "Anika Rao",
    referralCode: "REF-ANIKA",
    directReferrerId: "61003",
    agentOwnerId: "AG-1214",
    agentOwnerName: "South Desk",
    acquisitionSource: "USER_REFERRAL",
    registeredAt: "2026-08-15T08:00:00.000Z",
    status: "active",
    phone: "+91 98000 44190",
  },
  {
    userId: "22814",
    displayName: "Rohan Desai",
    referralCode: "REF-ROHAN",
    directReferrerId: "44190",
    agentOwnerId: "AG-0988",
    agentOwnerName: "West Desk",
    acquisitionSource: "USER_REFERRAL",
    registeredAt: "2026-08-28T16:20:00.000Z",
    status: "suspended",
    phone: "+91 98000 22814",
  },
  {
    userId: "55201",
    displayName: "Meera Iyer",
    referralCode: "REF-MEERA",
    directReferrerId: "22814",
    agentOwnerId: "AG-0988",
    agentOwnerName: "West Desk",
    acquisitionSource: "USER_REFERRAL",
    registeredAt: "2026-09-05T12:00:00.000Z",
    status: "active",
    phone: "+91 98000 55201",
  },
  {
    userId: "77330",
    displayName: "Vikram Nair",
    referralCode: "REF-VIKRAM",
    directReferrerId: null,
    agentOwnerId: "AG-1520",
    agentOwnerName: "Ridge Desk",
    acquisitionSource: "AGENT",
    registeredAt: "2026-09-10T10:00:00.000Z",
    status: "active",
    phone: "+91 98000 77330",
  },
  {
    userId: "88441",
    displayName: "Priya Kapoor",
    referralCode: "REF-PRIYA",
    directReferrerId: "77330",
    agentOwnerId: "AG-1520",
    agentOwnerName: "Ridge Desk",
    acquisitionSource: "USER_REFERRAL",
    registeredAt: "2026-09-18T11:30:00.000Z",
    status: "active",
    phone: "+91 98000 88441",
  },
  {
    userId: "99552",
    displayName: "Dev Malhotra",
    referralCode: "REF-DEV",
    directReferrerId: "27411",
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    acquisitionSource: "USER_REFERRAL",
    registeredAt: "2026-09-22T09:00:00.000Z",
    status: "locked",
    phone: "+91 98000 99552",
  },
];

for (let i = 0; i < 12; i += 1) {
  const id = String(42000 + i);
  seedReferralUsers.push({
    userId: id,
    displayName: `User ${id}`,
    referralCode: `REF-U${id}`,
    directReferrerId: i % 3 === 0 ? "33108" : i % 3 === 1 ? "19022" : "77330",
    agentOwnerId: i % 2 === 0 ? "AG-1042" : "AG-1520",
    agentOwnerName: i % 2 === 0 ? "East Desk" : "Ridge Desk",
    acquisitionSource: "USER_REFERRAL",
    registeredAt: `2026-09-${String(8 + (i % 18)).padStart(2, "0")}T10:00:00.000Z`,
    status: i % 7 === 0 ? "suspended" : "active",
    phone: `+91 98100 ${id.slice(-5)}`,
  });
}

export const seedCommissionConfig: CommissionConfigRecord[] = [
  { level: 1, rateBps: 100, status: "active", effectiveFrom: "2026-07-01T00:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z", updatedBy: "ops.admin" },
  { level: 2, rateBps: 75, status: "active", effectiveFrom: "2026-07-01T00:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z", updatedBy: "ops.admin" },
  { level: 3, rateBps: 50, status: "active", effectiveFrom: "2026-07-01T00:00:00.000Z", updatedAt: "2026-08-15T08:00:00.000Z", updatedBy: "ops.admin" },
  { level: 4, rateBps: 25, status: "active", effectiveFrom: "2026-07-01T00:00:00.000Z", updatedAt: "2026-08-15T08:00:00.000Z", updatedBy: "ops.admin" },
  { level: 5, rateBps: 15, status: "active", effectiveFrom: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-20T08:00:00.000Z", updatedBy: "ops.admin" },
  { level: 6, rateBps: 10, status: "active", effectiveFrom: "2026-07-01T00:00:00.000Z", updatedAt: "2026-07-20T08:00:00.000Z", updatedBy: "ops.admin" },
];

/**
 * Historical commissions: Level 2 applied 50 bps even though current config may differ.
 * Commission amounts are fixtures — not derived in the UI.
 */
export const seedCommissions: CommissionRecord[] = [
  {
    id: "RC-70001",
    betId: "BET-88421",
    betUserId: "55201",
    betUserName: "Meera Iyer",
    beneficiaryId: "22814",
    beneficiaryName: "Rohan Desai",
    level: 1,
    betAmountMinor: rupees(1000),
    appliedRateBps: 100,
    commissionAmountMinor: rupees(10),
    status: "posted",
    ledgerTransactionId: "TXN-RC-70001",
    agentOwnerId: "AG-0988",
    agentOwnerName: "West Desk",
    createdAt: "2026-09-27T10:00:00.000Z",
    updatedAt: "2026-09-27T10:05:00.000Z",
  },
  {
    id: "RC-70002",
    betId: "BET-88421",
    betUserId: "55201",
    betUserName: "Meera Iyer",
    beneficiaryId: "44190",
    beneficiaryName: "Anika Rao",
    level: 2,
    betAmountMinor: rupees(1000),
    appliedRateBps: 50,
    commissionAmountMinor: rupees(5),
    status: "posted",
    ledgerTransactionId: "TXN-RC-70002",
    agentOwnerId: "AG-1214",
    agentOwnerName: "South Desk",
    createdAt: "2026-09-27T10:00:00.000Z",
    updatedAt: "2026-09-27T10:05:00.000Z",
  },
  {
    id: "RC-70003",
    betId: "BET-88421",
    betUserId: "55201",
    betUserName: "Meera Iyer",
    beneficiaryId: "61003",
    beneficiaryName: "Arjun Sethi",
    level: 3,
    betAmountMinor: rupees(1000),
    appliedRateBps: 50,
    commissionAmountMinor: rupees(5),
    status: "posted",
    ledgerTransactionId: "TXN-RC-70003",
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    createdAt: "2026-09-27T10:00:00.000Z",
    updatedAt: "2026-09-27T10:05:00.000Z",
  },
  {
    id: "RC-70004",
    betId: "BET-88421",
    betUserId: "55201",
    betUserName: "Meera Iyer",
    beneficiaryId: "19022",
    beneficiaryName: "Kabir Menon",
    level: 4,
    betAmountMinor: rupees(1000),
    appliedRateBps: 25,
    commissionAmountMinor: 250,
    status: "posted",
    ledgerTransactionId: "TXN-RC-70004",
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    createdAt: "2026-09-27T10:00:00.000Z",
    updatedAt: "2026-09-27T10:05:00.000Z",
  },
  {
    id: "RC-70005",
    betId: "BET-88421",
    betUserId: "55201",
    betUserName: "Meera Iyer",
    beneficiaryId: "33108",
    beneficiaryName: "Sana Qureshi",
    level: 5,
    betAmountMinor: rupees(1000),
    appliedRateBps: 15,
    commissionAmountMinor: 150,
    status: "posted",
    ledgerTransactionId: "TXN-RC-70005",
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    createdAt: "2026-09-27T10:00:00.000Z",
    updatedAt: "2026-09-27T10:05:00.000Z",
  },
  {
    id: "RC-70006",
    betId: "BET-88421",
    betUserId: "55201",
    betUserName: "Meera Iyer",
    beneficiaryId: "27411",
    beneficiaryName: "Aditya Sharma",
    level: 6,
    betAmountMinor: rupees(1000),
    appliedRateBps: 10,
    commissionAmountMinor: 100,
    status: "posted",
    ledgerTransactionId: "TXN-RC-70006",
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    createdAt: "2026-09-27T10:00:00.000Z",
    updatedAt: "2026-09-27T10:05:00.000Z",
  },
  {
    id: "RC-70010",
    betId: "BET-91002",
    betUserId: "88441",
    betUserName: "Priya Kapoor",
    beneficiaryId: "77330",
    beneficiaryName: "Vikram Nair",
    level: 1,
    betAmountMinor: rupees(2500),
    appliedRateBps: 100,
    commissionAmountMinor: rupees(25),
    status: "pending",
    ledgerTransactionId: null,
    agentOwnerId: "AG-1520",
    agentOwnerName: "Ridge Desk",
    createdAt: "2026-09-28T07:00:00.000Z",
    updatedAt: "2026-09-28T07:00:00.000Z",
  },
  {
    id: "RC-70011",
    betId: "BET-91003",
    betUserId: "99552",
    betUserName: "Dev Malhotra",
    beneficiaryId: "27411",
    beneficiaryName: "Aditya Sharma",
    level: 1,
    betAmountMinor: rupees(800),
    appliedRateBps: 100,
    commissionAmountMinor: 800,
    status: "reversed",
    ledgerTransactionId: "TXN-RC-70011",
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    createdAt: "2026-09-20T12:00:00.000Z",
    updatedAt: "2026-09-21T09:00:00.000Z",
  },
  {
    id: "RC-70012",
    betId: "BET-91004",
    betUserId: "42001",
    betUserName: "User 42001",
    beneficiaryId: "33108",
    beneficiaryName: "Sana Qureshi",
    level: 1,
    betAmountMinor: rupees(500),
    appliedRateBps: 100,
    commissionAmountMinor: 500,
    status: "failed",
    ledgerTransactionId: null,
    agentOwnerId: "AG-1042",
    agentOwnerName: "East Desk",
    createdAt: "2026-09-19T15:00:00.000Z",
    updatedAt: "2026-09-19T15:30:00.000Z",
  },
];

for (let i = 0; i < 16; i += 1) {
  const level = ((i % 6) + 1) as ReferralLevel;
  seedCommissions.push({
    id: `RC-71${String(i).padStart(3, "0")}`,
    betId: `BET-92${String(i).padStart(3, "0")}`,
    betUserId: String(42000 + (i % 12)),
    betUserName: `User ${42000 + (i % 12)}`,
    beneficiaryId: i % 2 === 0 ? "27411" : "33108",
    beneficiaryName: i % 2 === 0 ? "Aditya Sharma" : "Sana Qureshi",
    level,
    betAmountMinor: rupees(1000 + i * 250),
    appliedRateBps: level === 2 ? 50 : seedCommissionConfig.find((c) => c.level === level)!.rateBps,
    commissionAmountMinor: rupees(2 + i),
    status: i % 5 === 0 ? "pending" : i % 7 === 0 ? "reversed" : "posted",
    ledgerTransactionId: i % 5 === 0 ? null : `TXN-RC-71${String(i).padStart(3, "0")}`,
    agentOwnerId: i % 2 === 0 ? "AG-1042" : "AG-1520",
    agentOwnerName: i % 2 === 0 ? "East Desk" : "Ridge Desk",
    createdAt: `2026-09-${String(10 + (i % 17)).padStart(2, "0")}T12:00:00.000Z`,
    updatedAt: `2026-09-${String(10 + (i % 17)).padStart(2, "0")}T13:00:00.000Z`,
  });
}

/** Explicit summary fixtures — not reconciled from list rows in the UI. */
export const referralSummaryFixture = {
  totalReferralUsers: seedReferralUsers.length,
  level1Users: 8,
  level2Users: 5,
  level3Users: 3,
  level4Users: 2,
  level5Users: 1,
  level6Users: 1,
  totalCommissionMinor: 4_85_000_00,
  postedCommissionMinor: 4_12_500_00,
  pendingCommissionMinor: 52_000_00,
  levelCommissionMinor: [1_80_000_00, 95_000_00, 72_000_00, 48_000_00, 30_000_00, 20_000_00] as const,
};

export const commissionSummaryFixture = {
  total: seedCommissions.length,
  pending: seedCommissions.filter((item) => item.status === "pending").length,
  posted: seedCommissions.filter((item) => item.status === "posted").length,
  reversed: seedCommissions.filter((item) => item.status === "reversed").length,
  failed: seedCommissions.filter((item) => item.status === "failed").length,
  pendingAmountMinor: 52_000_00,
  postedAmountMinor: 4_12_500_00,
};
