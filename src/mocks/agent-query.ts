import { AGENT_AS_OF, type AgentRecord, type AgentStatus } from "@/mocks/data/agents";
import type { AgentListQuery } from "@/lib/validation/agents";

const AS_OF_MS = Date.parse(AGENT_AS_OF);
const DAY_MS = 86_400_000;
const ONE_LAKH_MINOR = 10_000_000;
const TEN_LAKH_MINOR = 100_000_000;
const HIGH_TURNOVER_MINOR = 50_000_000;

export type AgentQueryResult = {
  items: AgentRecord[];
  total: number;
  summary: {
    totalAgents: number;
    activeAgents: number;
    suspendedAgents: number;
    balanceMinor: number;
    turnoverMinor: number;
    ggrMinor: number;
  };
};

function sumMinor(records: readonly AgentRecord[], key: "balanceMinor" | "turnoverMinor" | "ggrMinor"): number {
  return records.reduce((total, record) => total + record[key], 0);
}

function createdCutoff(created: AgentListQuery["created"]): number | null {
  if (created === "all") return null;
  const days = created === "7d" ? 7 : created === "30d" ? 30 : 90;
  return AS_OF_MS - days * DAY_MS;
}

function matches(record: AgentRecord, query: AgentListQuery): boolean {
  if (query.status !== "all" && record.status !== query.status) return false;
  if (query.activity !== "all" && record.activity !== query.activity) return false;
  const cutoff = createdCutoff(query.created);
  if (cutoff !== null && Date.parse(record.createdAt) < cutoff) return false;
  if (query.balance === "under_1l" && record.balanceMinor >= ONE_LAKH_MINOR) return false;
  if (query.balance === "1l_10l" && (record.balanceMinor < ONE_LAKH_MINOR || record.balanceMinor >= TEN_LAKH_MINOR)) {
    return false;
  }
  if (query.balance === "over_10l" && record.balanceMinor < TEN_LAKH_MINOR) return false;
  if (query.performance === "positive_ggr" && record.ggrMinor <= 0) return false;
  if (query.performance === "flat_ggr" && record.ggrMinor !== 0) return false;
  if (query.performance === "high_turnover" && record.turnoverMinor < HIGH_TURNOVER_MINOR) return false;
  const needle = query.q.trim().toLowerCase();
  if (needle.length === 0) return true;
  const haystack = `${record.id} ${record.name} ${record.contactName} ${record.username} ${record.email} ${record.phone}`.toLowerCase();
  return haystack.includes(needle);
}

function sortValue(record: AgentRecord, sort: AgentListQuery["sort"]): string | number {
  if (sort === "name") return record.name.toLowerCase();
  if (sort === "users") return record.users;
  if (sort === "balance") return record.balanceMinor;
  if (sort === "turnover") return record.turnoverMinor;
  if (sort === "ggr") return record.ggrMinor;
  if (sort === "commission") return record.commissionMinor;
  return record.createdAt;
}

export function queryAgents(records: readonly AgentRecord[], query: AgentListQuery): AgentQueryResult {
  const filtered = records.filter((record) => matches(record, query));
  const sorted = [...filtered].sort((left, right) => {
    const a = sortValue(left, query.sort);
    const b = sortValue(right, query.sort);
    const comparison = a < b ? -1 : a > b ? 1 : 0;
    return query.direction === "asc" ? comparison : -comparison;
  });
  const start = (query.page - 1) * query.pageSize;
  return {
    items: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    summary: {
      totalAgents: records.length,
      activeAgents: records.filter((record) => record.status === "active").length,
      suspendedAgents: records.filter((record) => record.status === "suspended").length,
      balanceMinor: sumMinor(records, "balanceMinor"),
      turnoverMinor: sumMinor(records, "turnoverMinor"),
      ggrMinor: sumMinor(records, "ggrMinor"),
    },
  };
}

export function nextAgentStatus(status: AgentStatus, action: "suspend" | "activate"): AgentStatus | null {
  if (action === "suspend") return status === "active" ? "suspended" : null;
  if (status === "active") return null;
  return "active";
}
