import { z } from "zod";
import { moneySchema } from "@/lib/validation/common";

export const agentStatusSchema = z.enum(["active", "suspended", "pending", "inactive"]);
export const agentActivitySchema = z.enum(["trading", "quiet"]);

export const agentListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  contactName: z.string(),
  username: z.string(),
  email: z.string(),
  phone: z.string(),
  status: agentStatusSchema,
  users: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  balance: moneySchema,
  turnover: moneySchema,
  ggr: moneySchema,
  commission: moneySchema,
  exposure: moneySchema,
  shareBps: z.number().int().nonnegative(),
  activity: agentActivitySchema,
  createdAt: z.string(),
});

export const agentSummarySchema = z.object({
  totalAgents: z.number().int().nonnegative(),
  activeAgents: z.number().int().nonnegative(),
  suspendedAgents: z.number().int().nonnegative(),
  balance: moneySchema,
  turnover: moneySchema,
  ggr: moneySchema,
});

export const agentListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().max(80).default(""),
  status: z.enum(["all", "active", "suspended", "pending", "inactive"]).default("all"),
  created: z.enum(["all", "7d", "30d", "90d"]).default("all"),
  balance: z.enum(["all", "under_1l", "1l_10l", "over_10l"]).default("all"),
  performance: z.enum(["all", "positive_ggr", "flat_ggr", "high_turnover"]).default("all"),
  activity: z.enum(["all", "trading", "quiet"]).default("all"),
  sort: z.enum(["name", "users", "balance", "turnover", "ggr", "commission", "createdAt"]).default("turnover"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const agentListResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  summary: agentSummarySchema,
  items: z.array(agentListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

const userRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["active", "suspended", "locked"]),
  balance: moneySchema,
  openBets: z.number().int().nonnegative(),
  lastLoginAt: z.string().nullable(),
});

const betRowSchema = z.object({
  id: z.string(),
  event: z.string(),
  market: z.string(),
  stake: moneySchema,
  status: z.string(),
  placedAt: z.string(),
});

const transactionRowSchema = z.object({
  id: z.string(),
  type: z.string(),
  direction: z.enum(["credit", "debit"]),
  amount: moneySchema,
  status: z.string(),
  reference: z.string(),
  createdAt: z.string(),
});

export const agentDetailSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  agent: agentListItemSchema,
  wallet: z.object({
    balance: moneySchema,
    held: moneySchema,
    commission: moneySchema,
  }),
  users: z.array(userRowSchema),
  bets: z.array(betRowSchema),
  transactions: z.array(transactionRowSchema),
  performance: z.array(
    z.object({
      date: z.string(),
      turnover: moneySchema,
      ggr: moneySchema,
    }),
  ),
  reports: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      period: z.string(),
      turnover: moneySchema,
      ggr: moneySchema,
    }),
  ),
  activity: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      detail: z.string(),
      at: z.string(),
    }),
  ),
});

const phoneSchema = z.string().trim().regex(/^\+91 \d{5} \d{5}$/, "Use the form +91 98000 00000.");
const emailSchema = z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email.");

export const createAgentSchema = z.object({
  name: z.string().trim().min(2, "Enter the desk name.").max(80),
  contactName: z.string().trim().min(2, "Enter the contact name.").max(80),
  username: z
    .string()
    .trim()
    .regex(/^[a-z0-9.]{3,32}$/, "Use 3–32 lowercase letters, numbers, or dots."),
  email: emailSchema,
  phone: phoneSchema,
});

export const updateAgentSchema = z.object({
  name: z.string().trim().min(2, "Enter the desk name.").max(80),
  contactName: z.string().trim().min(2, "Enter the contact name.").max(80),
  email: emailSchema,
  phone: phoneSchema,
});

export const agentStatusChangeSchema = z
  .object({
    action: z.enum(["suspend", "activate"]),
    reason: z.string().trim().max(240).default(""),
  })
  .superRefine((value, context) => {
    if (value.action === "suspend" && value.reason.length < 8) {
      context.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Enter a reason of at least 8 characters.",
      });
    }
  });

export const agentIdSchema = z.string().regex(/^AG-\d{4}$/);

export type AgentStatus = z.infer<typeof agentStatusSchema>;
export type AgentListItem = z.infer<typeof agentListItemSchema>;
export type AgentListQuery = z.infer<typeof agentListQuerySchema>;
export type AgentListResponse = z.infer<typeof agentListResponseSchema>;
export type AgentDetail = z.infer<typeof agentDetailSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type AgentStatusChange = z.infer<typeof agentStatusChangeSchema>;
