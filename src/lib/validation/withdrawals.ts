import { z } from "zod";
import { moneySchema } from "@/lib/validation/common";

export const withdrawalStatusSchema = z.enum(["pending", "approved", "rejected", "paid", "failed"]);

export const withdrawalListItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  amount: moneySchema,
  status: withdrawalStatusSchema,
  method: z.string(),
  providerReference: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reason: z.string().nullable(),
});

export const withdrawalListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().max(80).default(""),
  status: z.enum(["all", "pending", "approved", "rejected", "paid", "failed"]).default("all"),
  agent: z.string().default("all"),
  method: z.enum(["all", "UPI", "Bank transfer"]).default("all"),
  created: z.enum(["all", "7d", "30d", "90d"]).default("all"),
  sort: z.enum(["createdAt", "amount", "status", "updatedAt"]).default("createdAt"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const withdrawalSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  approved: z.number().int().nonnegative(),
  rejected: z.number().int().nonnegative(),
  paid: z.number().int().nonnegative(),
  pendingAmount: moneySchema,
  paidAmount: moneySchema,
});

export const withdrawalListResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  summary: withdrawalSummarySchema,
  agents: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(withdrawalListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const withdrawalDetailSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  withdrawal: withdrawalListItemSchema,
});

export const withdrawalStatusChangeSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    reason: z.string().trim().max(240).default(""),
  })
  .superRefine((value, context) => {
    if (value.action === "reject" && value.reason.length < 8) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Enter a reason of at least 8 characters.",
      });
    }
  });

export const withdrawalIdSchema = z.string().regex(/^WD-[A-Z0-9-]+$/);

export type WithdrawalListItem = z.infer<typeof withdrawalListItemSchema>;
export type WithdrawalListQuery = z.infer<typeof withdrawalListQuerySchema>;
export type WithdrawalListResponse = z.infer<typeof withdrawalListResponseSchema>;
export type WithdrawalDetail = z.infer<typeof withdrawalDetailSchema>;
export type WithdrawalStatusChange = z.infer<typeof withdrawalStatusChangeSchema>;
