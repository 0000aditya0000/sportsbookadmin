import { z } from "zod";
import { moneySchema } from "@/lib/validation/common";

export const transactionStatusSchema = z.enum(["posted", "pending", "failed"]);
export const transactionTypeSchema = z.enum([
  "deposit",
  "withdrawal",
  "bet_stake",
  "bet_settlement",
  "hold",
  "release",
  "adjustment",
  "commission",
]);

export const transactionListItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  walletId: z.string(),
  type: transactionTypeSchema,
  flow: z.enum(["credit", "debit"]),
  amount: moneySchema,
  status: transactionStatusSchema,
  reference: z.string(),
  createdAt: z.string(),
});

export const transactionListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().max(80).default(""),
  status: z.enum(["all", "posted", "pending", "failed"]).default("all"),
  type: z
    .enum(["all", "deposit", "withdrawal", "bet_stake", "bet_settlement", "hold", "release", "adjustment", "commission"])
    .default("all"),
  flow: z.enum(["all", "credit", "debit"]).default("all"),
  agent: z.string().default("all"),
  created: z.enum(["all", "7d", "30d", "90d"]).default("all"),
  sort: z.enum(["createdAt", "amount", "status", "type"]).default("createdAt"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const transactionSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  posted: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  creditVolume: moneySchema,
  debitVolume: moneySchema,
});

export const transactionListResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  summary: transactionSummarySchema,
  agents: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(transactionListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const transactionDetailSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  transaction: transactionListItemSchema,
});

export const transactionIdSchema = z.string().regex(/^TXN-[A-Z0-9-]+$/);

export type TransactionListItem = z.infer<typeof transactionListItemSchema>;
export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>;
export type TransactionListResponse = z.infer<typeof transactionListResponseSchema>;
export type TransactionDetail = z.infer<typeof transactionDetailSchema>;
