import { expect, test } from "vitest";
import { nextAgentStatus, queryAgents } from "@/mocks/agent-query";
import { seedAgents } from "@/mocks/data/agents";
import type { AgentListQuery } from "@/lib/validation/agents";

const baseQuery: AgentListQuery = {
  page: 1,
  pageSize: 10,
  q: "",
  status: "all",
  created: "all",
  balance: "all",
  performance: "all",
  activity: "all",
  sort: "turnover",
  direction: "desc",
};

test("searches agents by phone without loading the full book into the page", () => {
  const result = queryAgents(seedAgents, { ...baseQuery, q: "98000 01042", pageSize: 10 });
  expect(result.items.map((agent) => agent.id)).toEqual(["AG-1042"]);
  expect(result.total).toBe(1);
  expect(result.summary.totalAgents).toBe(seedAgents.length);
});

test("sorts and pages on the server-side query", () => {
  const result = queryAgents(seedAgents, baseQuery);
  expect(result.items[0]?.id).toBe("AG-1042");
  expect(result.items).toHaveLength(10);
  expect(result.total).toBe(seedAgents.length);
  const second = queryAgents(seedAgents, { ...baseQuery, page: 2 });
  expect(second.items).toHaveLength(seedAgents.length - 10);
  expect(second.items.some((agent) => agent.id === "AG-1042")).toBe(false);
});

test("sums book totals with integer minor units", () => {
  const result = queryAgents(seedAgents, baseQuery);
  const balance = seedAgents.reduce((total, agent) => total + agent.balanceMinor, 0);
  expect(result.summary.balanceMinor).toBe(balance);
  expect(Number.isInteger(result.summary.turnoverMinor)).toBe(true);
  expect(result.summary.activeAgents).toBe(seedAgents.filter((agent) => agent.status === "active").length);
});

test("status changes follow the backend rule", () => {
  expect(nextAgentStatus("active", "suspend")).toBe("suspended");
  expect(nextAgentStatus("suspended", "suspend")).toBeNull();
  expect(nextAgentStatus("pending", "activate")).toBe("active");
  expect(nextAgentStatus("active", "activate")).toBeNull();
});
