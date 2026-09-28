import { z } from "zod";
import { moneySchema } from "@/lib/validation/common";

export const userStatusSchema = z.enum(["active", "suspended", "banned", "locked"]);

export const userListItemSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  username: z.string(),
  phone: z.string(),
  email: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  status: userStatusSchema,
  balance: moneySchema,
  held: moneySchema,
  openBets: z.number().int().nonnegative(),
  totalBets: z.number().int().nonnegative(),
  turnover: moneySchema,
  ggr: moneySchema,
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  hasActiveSession: z.boolean(),
  activeSessionId: z.string().nullable(),
});

export const userSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  suspended: z.number().int().nonnegative(),
  banned: z.number().int().nonnegative(),
  locked: z.number().int().nonnegative(),
  online: z.number().int().nonnegative(),
  balance: moneySchema,
});

export const userListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().max(80).default(""),
  status: z.enum(["all", "active", "suspended", "banned", "locked"]).default("all"),
  agent: z.string().default("all"),
  created: z.enum(["all", "7d", "30d", "90d"]).default("all"),
  balance: z.enum(["all", "under_10k", "10k_1l", "over_1l"]).default("all"),
  activity: z.enum(["all", "online", "quiet"]).default("all"),
  betting: z.enum(["all", "open", "settled", "none"]).default("all"),
  sort: z
    .enum(["name", "id", "agent", "balance", "openBets", "turnover", "lastLogin", "createdAt"])
    .default("turnover"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const userListResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  summary: userSummarySchema,
  agents: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(userListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

const betSchema = z.object({
  id: z.string(),
  event: z.string(),
  market: z.string(),
  selection: z.string(),
  stake: moneySchema,
  odds: z.string(),
  potentialPayout: moneySchema,
  status: z.enum(["open", "settled", "rejected", "cancelled"]),
  settlement: z.string(),
  placedAt: z.string(),
});

const transactionSchema = z.object({
  id: z.string(),
  type: z.string(),
  direction: z.enum(["credit", "debit"]),
  amount: moneySchema,
  status: z.string(),
  reference: z.string(),
  createdAt: z.string(),
});

const sessionSchema = z.object({
  id: z.string(),
  device: z.string(),
  browser: z.string(),
  os: z.string(),
  ip: z.string(),
  loginAt: z.string(),
  lastActiveAt: z.string(),
  expiresAt: z.string(),
  status: z.enum(["active", "revoked", "expired"]),
});

const activitySchema = z.object({
  id: z.string(),
  action: z.string(),
  title: z.string(),
  detail: z.string(),
  at: z.string(),
});

const riskSchema = z.object({
  available: z.boolean(),
  message: z.string(),
  exposure: moneySchema.nullable(),
  openBets: z.number().int().nonnegative().nullable(),
  largeBetIds: z.array(z.string()),
  flags: z.array(z.string()),
  maxStake: moneySchema.nullable(),
});

export const userDetailSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  user: userListItemSchema,
  wallet: z.object({
    available: moneySchema,
    held: moneySchema,
  }),
  bets: z.array(betSchema),
  transactions: z.array(transactionSchema),
  sessions: z.array(sessionSchema),
  activity: z.array(activitySchema),
  risk: riskSchema,
});

export const userStatusChangeSchema = z
  .object({
    action: z.enum(["suspend", "activate", "ban", "unlock"]),
    reason: z.string().trim().max(240).default(""),
  })
  .superRefine((value, context) => {
    if ((value.action === "suspend" || value.action === "ban") && value.reason.length < 8) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Enter a reason of at least 8 characters.",
      });
    }
  });

export const userIdSchema = z.string().regex(/^\d{5}$/);
export const userSessionIdSchema = z.string().regex(/^SES-[A-Z0-9-]+$/);

export const userStatusResponseSchema = z.object({
  user: userListItemSchema,
});

export const userSessionRevokeResponseSchema = z.object({
  userId: z.string(),
  session: sessionSchema,
});

export type UserStatus = z.infer<typeof userStatusSchema>;
export type UserListItem = z.infer<typeof userListItemSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
export type UserDetail = z.infer<typeof userDetailSchema>;
export type UserStatusChange = z.infer<typeof userStatusChangeSchema>;
export type UserBet = z.infer<typeof betSchema>;
export type UserSessionView = z.infer<typeof sessionSchema>;
