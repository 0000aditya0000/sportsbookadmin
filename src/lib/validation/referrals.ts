import { z } from "zod";
import { moneySchema } from "@/lib/validation/common";

/** Six-level referral depth. Level 7 does not exist. */
export const referralLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const acquisitionSourceSchema = z.enum(["AGENT", "USER_REFERRAL"]);

export const commissionStatusSchema = z.enum(["pending", "posted", "reversed", "failed"]);

export const referralUserStatusSchema = z.enum(["active", "suspended", "banned", "locked"]);

export const ratePercentSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Use a percentage with up to 2 decimal places.")
  .refine((value) => Number(value) >= 0 && Number(value) <= 100, "Percentage must be between 0 and 100.");

export const levelBreakdownSchema = z.object({
  level: referralLevelSchema,
  users: z.number().int().nonnegative(),
  commission: moneySchema,
});

export const referralSummarySchema = z.object({
  totalReferralUsers: z.number().int().nonnegative(),
  level1Users: z.number().int().nonnegative(),
  level2Users: z.number().int().nonnegative(),
  level3Users: z.number().int().nonnegative(),
  level4Users: z.number().int().nonnegative(),
  level5Users: z.number().int().nonnegative(),
  level6Users: z.number().int().nonnegative(),
  totalCommission: moneySchema,
  postedCommission: moneySchema,
  pendingCommission: moneySchema,
  levels: z.array(levelBreakdownSchema).length(6),
});

export const referralUserListItemSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  referralCode: z.string(),
  directReferrerId: z.string().nullable(),
  directReferrerName: z.string().nullable(),
  /** Depth under the queried network root when listing; null for roots without an upline in scope. */
  referralLevel: referralLevelSchema.nullable(),
  agentOwnerId: z.string(),
  agentOwnerName: z.string(),
  acquisitionSource: acquisitionSourceSchema,
  registeredAt: z.string(),
  status: referralUserStatusSchema,
  totalCommission: moneySchema,
});

export const referralUserListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().max(80).default(""),
  referrer: z.string().default("all"),
  agent: z.string().default("all"),
  level: z.enum(["all", "1", "2", "3", "4", "5", "6"]).default("all"),
  source: z.enum(["all", "AGENT", "USER_REFERRAL"]).default("all"),
  status: z.enum(["all", "active", "suspended", "banned", "locked"]).default("all"),
  registered: z.enum(["all", "7d", "30d", "90d"]).default("all"),
  sort: z.enum(["registeredAt", "totalCommission", "displayName", "referralLevel"]).default("registeredAt"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const referralUserListResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  summary: referralSummarySchema,
  agents: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(referralUserListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const referralTreeNodeSchema: z.ZodType<{
  userId: string;
  displayName: string;
  referralCode: string;
  status: "active" | "suspended" | "banned" | "locked";
  registeredAt: string;
  directReferrerId: string | null;
  directReferrerName: string | null;
  agentOwnerId: string;
  agentOwnerName: string;
  referralLevel: 1 | 2 | 3 | 4 | 5 | 6;
  commissionGenerated: { amountMinor: number; currency: "INR" };
  children: unknown[];
}> = z.lazy(() =>
  z.object({
    userId: z.string(),
    displayName: z.string(),
    referralCode: z.string(),
    status: referralUserStatusSchema,
    registeredAt: z.string(),
    directReferrerId: z.string().nullable(),
    directReferrerName: z.string().nullable(),
    agentOwnerId: z.string(),
    agentOwnerName: z.string(),
    referralLevel: referralLevelSchema,
    commissionGenerated: moneySchema,
    children: z.array(referralTreeNodeSchema),
  }),
);

export const referralTreeResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  root: z.object({
    userId: z.string(),
    displayName: z.string(),
    referralCode: z.string(),
    directReferrerId: z.string().nullable(),
    directReferrerName: z.string().nullable(),
    agentOwnerId: z.string(),
    agentOwnerName: z.string(),
    registeredAt: z.string(),
    status: referralUserStatusSchema,
  }),
  levels: z.array(
    z.object({
      level: referralLevelSchema,
      nodes: z.array(referralTreeNodeSchema),
    }),
  ),
});

export const referralTreeQuerySchema = z.object({
  userId: z.string().min(1).max(32),
});

export const userReferralDetailSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  userId: z.string(),
  displayName: z.string(),
  referralCode: z.string(),
  directReferrerId: z.string().nullable(),
  directReferrerName: z.string().nullable(),
  acquisitionSource: acquisitionSourceSchema,
  agentOwnerId: z.string(),
  agentOwnerName: z.string(),
  referralLevel: referralLevelSchema.nullable(),
  network: z.object({
    level1: z.number().int().nonnegative(),
    level2: z.number().int().nonnegative(),
    level3: z.number().int().nonnegative(),
    level4: z.number().int().nonnegative(),
    level5: z.number().int().nonnegative(),
    level6: z.number().int().nonnegative(),
  }),
  commissions: z.object({
    total: moneySchema,
    pending: moneySchema,
    posted: moneySchema,
    reversed: moneySchema,
    byLevel: z.array(
      z.object({
        level: referralLevelSchema,
        amount: moneySchema,
      }),
    ),
  }),
});

export const agentReferralDetailSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  agentReferralCode: z.string(),
  directReferrals: z.number().int().nonnegative(),
  totalDownline: z.number().int().nonnegative(),
  network: z.object({
    level1: z.number().int().nonnegative(),
    level2: z.number().int().nonnegative(),
    level3: z.number().int().nonnegative(),
    level4: z.number().int().nonnegative(),
    level5: z.number().int().nonnegative(),
    level6: z.number().int().nonnegative(),
  }),
  commissionGenerated: moneySchema,
});

export const referralCommissionListItemSchema = z.object({
  id: z.string(),
  betId: z.string(),
  betUserId: z.string(),
  betUserName: z.string(),
  beneficiaryId: z.string(),
  beneficiaryName: z.string(),
  level: referralLevelSchema,
  betAmount: moneySchema,
  /** Historical rate applied when this commission was generated (percent string, e.g. "0.50"). */
  appliedRatePercent: z.string(),
  commissionAmount: moneySchema,
  status: commissionStatusSchema,
  ledgerTransactionId: z.string().nullable(),
  agentOwnerId: z.string(),
  agentOwnerName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const referralCommissionListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().max(80).default(""),
  beneficiary: z.string().default("all"),
  betUser: z.string().default("all"),
  betId: z.string().default(""),
  level: z.enum(["all", "1", "2", "3", "4", "5", "6"]).default("all"),
  agent: z.string().default("all"),
  status: z.enum(["all", "pending", "posted", "reversed", "failed"]).default("all"),
  created: z.enum(["all", "7d", "30d", "90d"]).default("all"),
  sort: z.enum(["createdAt", "betAmount", "commissionAmount", "level", "status"]).default("createdAt"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const commissionSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  posted: z.number().int().nonnegative(),
  reversed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  pendingAmount: moneySchema,
  postedAmount: moneySchema,
});

export const referralCommissionListResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  summary: commissionSummarySchema,
  agents: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(referralCommissionListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const referralCommissionDetailSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  commission: referralCommissionListItemSchema,
  /** Current config rate for this level — separate from historical appliedRatePercent. */
  currentRatePercent: z.string(),
  directReferrerId: z.string().nullable(),
  directReferrerName: z.string().nullable(),
});

export const commissionConfigItemSchema = z.object({
  level: referralLevelSchema,
  ratePercent: z.string(),
  status: z.enum(["active", "inactive"]),
  effectiveFrom: z.string(),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

export const commissionConfigResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  items: z.array(commissionConfigItemSchema).length(6),
});

export const commissionConfigUpdateSchema = z.object({
  level: referralLevelSchema,
  commissionPercentage: ratePercentSchema,
});

export const referralReportResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  filters: z.object({
    created: z.enum(["all", "7d", "30d", "90d"]),
    agent: z.string(),
    level: z.enum(["all", "1", "2", "3", "4", "5", "6"]),
    status: z.enum(["all", "pending", "posted", "reversed", "failed"]),
  }),
  byLevel: z.array(
    z.object({
      level: referralLevelSchema,
      commissions: z.number().int().nonnegative(),
      amount: moneySchema,
    }),
  ),
  byStatus: z.array(
    z.object({
      status: commissionStatusSchema,
      count: z.number().int().nonnegative(),
      amount: moneySchema,
    }),
  ),
  registrationStats: z.object({
    agentAcquired: z.number().int().nonnegative(),
    userReferral: z.number().int().nonnegative(),
  }),
  totals: z.object({
    commissionAmount: moneySchema,
    postedAmount: moneySchema,
    pendingAmount: moneySchema,
  }),
});

export const referralReportQuerySchema = z.object({
  created: z.enum(["all", "7d", "30d", "90d"]).default("30d"),
  agent: z.string().default("all"),
  level: z.enum(["all", "1", "2", "3", "4", "5", "6"]).default("all"),
  status: z.enum(["all", "pending", "posted", "reversed", "failed"]).default("all"),
});

export const referralCodeSchema = z.string().regex(/^REF-[A-Z0-9-]+$/);
export const commissionIdSchema = z.string().regex(/^RC-[A-Z0-9-]+$/);

export type ReferralLevel = z.infer<typeof referralLevelSchema>;
export type AcquisitionSource = z.infer<typeof acquisitionSourceSchema>;
export type CommissionStatus = z.infer<typeof commissionStatusSchema>;
export type ReferralUserStatus = z.infer<typeof referralUserStatusSchema>;
export type ReferralSummary = z.infer<typeof referralSummarySchema>;
export type ReferralUserListItem = z.infer<typeof referralUserListItemSchema>;
export type ReferralUserListQuery = z.infer<typeof referralUserListQuerySchema>;
export type ReferralUserListResponse = z.infer<typeof referralUserListResponseSchema>;
export type ReferralTreeNode = z.infer<typeof referralTreeNodeSchema>;
export type ReferralTreeResponse = z.infer<typeof referralTreeResponseSchema>;
export type UserReferralDetail = z.infer<typeof userReferralDetailSchema>;
export type AgentReferralDetail = z.infer<typeof agentReferralDetailSchema>;
export type ReferralCommissionListItem = z.infer<typeof referralCommissionListItemSchema>;
export type ReferralCommissionListQuery = z.infer<typeof referralCommissionListQuerySchema>;
export type ReferralCommissionListResponse = z.infer<typeof referralCommissionListResponseSchema>;
export type ReferralCommissionDetail = z.infer<typeof referralCommissionDetailSchema>;
export type CommissionConfigItem = z.infer<typeof commissionConfigItemSchema>;
export type CommissionConfigResponse = z.infer<typeof commissionConfigResponseSchema>;
export type CommissionConfigUpdate = z.infer<typeof commissionConfigUpdateSchema>;
export type ReferralReportResponse = z.infer<typeof referralReportResponseSchema>;
export type ReferralReportQuery = z.infer<typeof referralReportQuerySchema>;
