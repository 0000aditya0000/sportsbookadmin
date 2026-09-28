import "server-only";

import type { Money } from "@/lib/format";
import {
  controlTimeline,
  DASHBOARD_GENERATED_AT,
  liveOperations,
  riskAlerts,
  sportMix,
  topAgents,
  turnoverSeries,
} from "@/mocks/data/dashboard";
import { dashboardSchema, type DashboardQuery, type DashboardSnapshot } from "@/lib/validation/dashboard";

function money(rupees: number): Money {
  if (!Number.isInteger(rupees)) {
    throw new Error("Fixture amounts must be integer rupees.");
  }
  return { amountMinor: rupees * 100, currency: "INR" };
}

function windowFor(range: DashboardQuery["range"]) {
  if (range === "today") return turnoverSeries.slice(-1);
  if (range === "7d") return turnoverSeries.slice(-7);
  return turnoverSeries;
}

export function getDashboardSnapshot(query: DashboardQuery): DashboardSnapshot {
  const filtered = liveOperations.filter((row) => {
    const matchesStatus = query.status === "all" || row.status === query.status;
    const haystack = `${row.reference} ${row.event} ${row.market}`.toLowerCase();
    const matchesQuery = query.q.length === 0 || haystack.includes(query.q.trim().toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const sorted = [...filtered].sort((left, right) => {
    const comparison =
      query.sort === "stake"
        ? left.stakeRupees - right.stakeRupees
        : query.sort === "event"
          ? left.event.localeCompare(right.event)
          : left.placedAt.localeCompare(right.placedAt);
    return query.dir === "asc" ? comparison : -comparison;
  });

  const start = (query.page - 1) * query.pageSize;
  const pageRows = sorted.slice(start, start + query.pageSize);

  const snapshot = {
    source: "mock" as const,
    generatedAt: DASHBOARD_GENERATED_AT,
    health: {
      provider: { status: "connected" as const, name: "Dummy Provider", latencyMs: 42 },
      api: { status: "healthy" as const, latencyMs: 18 },
      websocket: { status: "connected" as const },
      liveData: { status: "active" as const },
    },
    kpis: {
      totalUsers: 24820,
      activeUsers: 8421,
      totalAgents: 42,
      turnover: money(4852300),
      ggr: money(682410),
      openBets: 1248,
      liveBets: 186,
      exposure: money(1284500),
      walletLiability: money(3142800),
    },
    cashflow: {
      deposits: money(1840000),
      withdrawals: money(1125500),
      pendingWithdrawals: money(462000),
      net: money(714500),
    },
    betting: {
      total: 6521,
      live: 186,
      settled: 5104,
      pending: 96,
      rejected: 73,
    },
    series: windowFor(query.range).map((point) => ({
      date: point.date,
      turnover: money(point.turnoverRupees),
      ggr: money(point.ggrRupees),
      deposits: money(point.depositsRupees),
      withdrawals: money(point.withdrawalsRupees),
      bets: point.bets,
    })),
    sports: sportMix.map((sport) => ({
      sport: sport.sport,
      turnover: money(sport.turnoverRupees),
      shareBps: sport.shareBps,
    })),
    agents: topAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      users: agent.users,
      turnover: money(agent.turnoverRupees),
      ggr: money(agent.ggrRupees),
    })),
    operations: {
      rows: pageRows.map((row) => ({
        id: row.id,
        reference: row.reference,
        event: row.event,
        market: row.market,
        stake: money(row.stakeRupees),
        status: row.status,
        placedAt: row.placedAt,
      })),
      total: sorted.length,
      page: query.page,
      pageSize: query.pageSize,
    },
    alerts: riskAlerts.map((alert) => ({ ...alert })),
    provider: {
      name: "Dummy Provider",
      kind: "dummy" as const,
      status: "connected" as const,
      latencyMs: 42,
      lastSuccessAt: "2026-09-28T08:14:12.000Z",
      lastError: null,
      lastSyncAt: "2026-09-28T08:14:12.000Z",
      websocket: "connected" as const,
      eventsSynchronized: 186,
      oddsSynchronized: 2408,
    },
    timeline: controlTimeline.map((item) => ({ ...item })),
  };

  return dashboardSchema.parse(snapshot);
}
