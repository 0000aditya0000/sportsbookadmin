import { z } from "zod";
import { moneySchema } from "@/lib/validation/common";

export const depositStatusSchema = z.enum(["pending", "completed", "rejected", "reversed"]);

export const depositListItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  agentId: z.string(),
  agentName: z.string(),
  amount: moneySchema,
  status: depositStatusSchema,
  method: z.string(),
  providerReference: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reason: z.string().nullable(),
});

export const depositListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().max(80).default(""),
  status: z.enum(["all", "pending", "completed", "rejected", "reversed"]).default("all"),
  agent: z.string().default("all"),
  method: z.enum(["all", "UPI", "Bank transfer"]).default("all"),
  created: z.enum(["all", "7d", "30d", "90d"]).default("all"),
  sort: z.enum(["createdAt", "amount", "status", "updatedAt"]).default("createdAt"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const depositSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  rejected: z.number().int().nonnegative(),
  reversed: z.number().int().nonnegative(),
  pendingAmount: moneySchema,
  completedAmount: moneySchema,
});

export const depositListResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  summary: depositSummarySchema,
  agents: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(depositListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const depositDetailSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  deposit: depositListItemSchema,
});

export const depositStatusChangeSchema = z
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

export const depositIdSchema = z.string().regex(/^DEP-[A-Z0-9-]+$/);

export type DepositListItem = z.infer<typeof depositListItemSchema>;
export type DepositListQuery = z.infer<typeof depositListQuerySchema>;
export type DepositListResponse = z.infer<typeof depositListResponseSchema>;
export type DepositDetail = z.infer<typeof depositDetailSchema>;
export type DepositStatusChange = z.infer<typeof depositStatusChangeSchema>;
