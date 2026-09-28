import { z } from "zod";
import { moneySchema } from "@/lib/validation/common";

export const walletOwnerTypeSchema = z.enum(["user", "agent", "system"]);
export const walletStatusSchema = z.enum(["active", "frozen", "suspended", "closed"]);

export const walletListItemSchema = z.object({
  id: z.string(),
  walletId: z.string(),
  ownerType: walletOwnerTypeSchema,
  ownerId: z.string(),
  ownerName: z.string(),
  agentId: z.string().nullable(),
  agentName: z.string().nullable(),
  status: walletStatusSchema,
  availableBalance: moneySchema,
  heldBalance: moneySchema,
  totalBalance: moneySchema,
  createdAt: z.string(),
  lastActivityAt: z.string().nullable(),
});

export const walletSummarySchema = z.object({
  totalBalance: moneySchema,
  availableBalance: moneySchema,
  heldBalance: moneySchema,
  walletLiability: moneySchema,
  userWalletBalance: moneySchema,
  agentWalletBalance: moneySchema,
  platformHeld: moneySchema,
  activeWallets: z.number().int().nonnegative(),
  frozenWallets: z.number().int().nonnegative(),
  pendingWallets: z.number().int().nonnegative(),
});

export const walletListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().max(80).default(""),
  type: z.enum(["all", "user", "agent", "system"]).default("all"),
  status: z.enum(["all", "active", "frozen", "suspended", "closed"]).default("all"),
  agent: z.string().default("all"),
  balance: z.enum(["all", "under_10k", "10k_1l", "over_1l", "zero", "negative"]).default("all"),
  activity: z.enum(["all", "today", "7d", "quiet"]).default("all"),
  created: z.enum(["all", "7d", "30d", "90d"]).default("all"),
  sort: z
    .enum(["availableBalance", "heldBalance", "totalBalance", "lastActivity", "createdAt", "owner"])
    .default("availableBalance"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const walletListResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  summary: walletSummarySchema,
  agents: z.array(z.object({ id: z.string(), name: z.string() })),
  activityAvailable: z.literal(false),
  activityMessage: z.string(),
  items: z.array(walletListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const walletIdSchema = z.string().regex(/^WLT-(USER|AGENT|SYSTEM)-[A-Z0-9-]+$/);

export type WalletListItem = z.infer<typeof walletListItemSchema>;
export type WalletListQuery = z.infer<typeof walletListQuerySchema>;
export type WalletListResponse = z.infer<typeof walletListResponseSchema>;
export type WalletStatus = z.infer<typeof walletStatusSchema>;
export type WalletOwnerType = z.infer<typeof walletOwnerTypeSchema>;
