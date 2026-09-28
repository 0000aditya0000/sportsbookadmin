import { z } from "zod";
import { moneySchema } from "@/lib/validation/common";

export const dashboardQuerySchema = z.object({
  range: z.enum(["today", "7d", "14d"]).default("14d"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(6),
  q: z.string().max(80).default(""),
  status: z.enum(["all", "open", "live", "pending", "settled", "rejected"]).default("all"),
  sort: z.enum(["placedAt", "stake", "event"]).default("placedAt"),
  dir: z.enum(["asc", "desc"]).default("desc"),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

const healthStateSchema = z.enum(["connected", "healthy", "active", "degraded", "down"]);

const seriesPointSchema = z.object({
  date: z.string(),
  turnover: moneySchema,
  ggr: moneySchema,
  deposits: moneySchema,
  withdrawals: moneySchema,
  bets: z.number().int().nonnegative(),
});

export const dashboardSchema = z.object({
  source: z.enum(["mock", "live"]),
  generatedAt: z.string(),
  health: z.object({
    provider: z.object({ status: healthStateSchema, name: z.string(), latencyMs: z.number().int() }),
    api: z.object({ status: healthStateSchema, latencyMs: z.number().int() }),
    websocket: z.object({ status: healthStateSchema }),
    liveData: z.object({ status: healthStateSchema }),
  }),
  kpis: z.object({
    totalUsers: z.number().int(),
    activeUsers: z.number().int(),
    totalAgents: z.number().int(),
    turnover: moneySchema,
    ggr: moneySchema,
    openBets: z.number().int(),
    liveBets: z.number().int(),
    exposure: moneySchema,
    walletLiability: moneySchema,
  }),
  cashflow: z.object({
    deposits: moneySchema,
    withdrawals: moneySchema,
    pendingWithdrawals: moneySchema,
    net: moneySchema,
  }),
  betting: z.object({
    total: z.number().int(),
    live: z.number().int(),
    settled: z.number().int(),
    pending: z.number().int(),
    rejected: z.number().int(),
  }),
  series: z.array(seriesPointSchema),
  sports: z.array(
    z.object({
      sport: z.string(),
      turnover: moneySchema,
      shareBps: z.number().int(),
    }),
  ),
  agents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      users: z.number().int(),
      turnover: moneySchema,
      ggr: moneySchema,
    }),
  ),
  operations: z.object({
    rows: z.array(
      z.object({
        id: z.string(),
        reference: z.string(),
        event: z.string(),
        market: z.string(),
        stake: moneySchema,
        status: z.enum(["open", "live", "pending", "settled", "rejected"]),
        placedAt: z.string(),
      }),
    ),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
  }),
  alerts: z.array(
    z.object({
      id: z.string(),
      severity: z.enum(["info", "warning", "critical"]),
      title: z.string(),
      detail: z.string(),
      at: z.string(),
    }),
  ),
  provider: z.object({
    name: z.string(),
    kind: z.enum(["dummy", "third_party"]),
    status: z.enum(["connected", "degraded", "down"]),
    latencyMs: z.number().int(),
    lastSuccessAt: z.string(),
    lastError: z.string().nullable(),
    lastSyncAt: z.string(),
    websocket: z.enum(["connected", "disconnected"]),
    eventsSynchronized: z.number().int(),
    oddsSynchronized: z.number().int(),
  }),
  timeline: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      detail: z.string(),
      at: z.string(),
    }),
  ),
});

export type DashboardSnapshot = z.infer<typeof dashboardSchema>;
export type LiveOperation = DashboardSnapshot["operations"]["rows"][number];
