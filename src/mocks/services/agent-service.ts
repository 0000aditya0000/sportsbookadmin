import "server-only";

import { randomBytes } from "node:crypto";
import type { Money } from "@/lib/format";
import { nextAgentStatus, queryAgents } from "@/mocks/agent-query";
import { AGENT_AS_OF, performanceSeries, seedAgents, type AgentRecord } from "@/mocks/data/agents";
import {
  agentDetailSchema,
  agentListResponseSchema,
  type AgentDetail,
  type AgentListQuery,
  type AgentListResponse,
  type AgentStatusChange,
  type CreateAgentInput,
  type UpdateAgentInput,
} from "@/lib/validation/agents";
import { ownerWalletBalances } from "@/mocks/services/wallet-service";

type ServiceError = { ok: false; code: "NOT_FOUND" | "CONFLICT"; message: string };
type ServiceOk<T> = { ok: true; data: T };

function money(minor: number): Money {
  return { amountMinor: minor, currency: "INR" };
}

function clone(record: AgentRecord): AgentRecord {
  return { ...record, events: record.events.map((event) => ({ ...event })) };
}

const agents: AgentRecord[] = seedAgents.map(clone);
let revisedAt = AGENT_AS_OF;
let sequence = 2001;

const userRoster = [
  { id: "27411", name: "Aditya Sharma", status: "active" as const, balance: 12450, openBets: 3, lastLoginAt: "2026-09-28T07:40:00.000Z" },
  { id: "19022", name: "Kabir Menon", status: "active" as const, balance: 8400, openBets: 1, lastLoginAt: "2026-09-28T06:12:00.000Z" },
  { id: "33108", name: "Sana Qureshi", status: "active" as const, balance: 25600, openBets: 4, lastLoginAt: "2026-09-28T05:02:00.000Z" },
  { id: "USR-22814", name: "User 22814", status: "suspended" as const, balance: 1200, openBets: 0, lastLoginAt: "2026-09-21T11:18:00.000Z" },
  { id: "USR-44190", name: "User 44190", status: "locked" as const, balance: 0, openBets: 0, lastLoginAt: null },
  { id: "USR-11820", name: "User 11820", status: "active" as const, balance: 6700, openBets: 2, lastLoginAt: "2026-09-27T16:44:00.000Z" },
];

const betRoster = [
  { id: "BET-88421", event: "MI vs CSK", market: "Match Odds", stake: 25000, status: "live", placedAt: "2026-09-28T07:42:11.000Z" },
  { id: "BET-88402", event: "Arsenal vs Chelsea", market: "Over 2.5", stake: 12500, status: "open", placedAt: "2026-09-28T07:36:04.000Z" },
  { id: "BET-88371", event: "IND vs AUS", market: "Session 24", stake: 15000, status: "live", placedAt: "2026-09-28T07:21:18.000Z" },
  { id: "BET-88290", event: "Real Madrid vs Barcelona", market: "Match Odds", stake: 32000, status: "open", placedAt: "2026-09-28T06:31:55.000Z" },
];

function touch() {
  revisedAt = new Date().toISOString();
}

function toListItem(record: AgentRecord) {
  return {
    id: record.id,
    name: record.name,
    contactName: record.contactName,
    username: record.username,
    email: record.email,
    phone: record.phone,
    status: record.status,
    users: record.users,
    activeUsers: record.activeUsers,
    balance: money(record.balanceMinor),
    turnover: money(record.turnoverMinor),
    ggr: money(record.ggrMinor),
    commission: money(record.commissionMinor),
    exposure: money(record.exposureMinor),
    shareBps: record.shareBps,
    activity: record.activity,
    createdAt: record.createdAt,
  };
}

function duplicate(input: { username: string; email: string; phone: string }, ignoreId?: string): string | null {
  const username = input.username.toLowerCase();
  const email = input.email.toLowerCase();
  const phone = input.phone;
  for (const agent of agents) {
    if (agent.id === ignoreId) continue;
    if (agent.username.toLowerCase() === username) return "That username is already in use.";
    if (agent.email.toLowerCase() === email) return "That email is already in use.";
    if (agent.phone === phone) return "That phone number is already in use.";
  }
  return null;
}

export function listAgentRecords(query: AgentListQuery): AgentListResponse {
  const result = queryAgents(agents, query);
  return agentListResponseSchema.parse({
    source: "mock",
    generatedAt: revisedAt,
    summary: {
      totalAgents: result.summary.totalAgents,
      activeAgents: result.summary.activeAgents,
      suspendedAgents: result.summary.suspendedAgents,
      balance: money(result.summary.balanceMinor),
      turnover: money(result.summary.turnoverMinor),
      ggr: money(result.summary.ggrMinor),
    },
    items: result.items.map(toListItem),
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
}

export function getAgentRecord(agentId: string): ServiceOk<AgentDetail> | ServiceError {
  const index = agents.findIndex((agent) => agent.id === agentId);
  const record = agents[index];
  if (!record) return { ok: false, code: "NOT_FOUND", message: "That agent was not found." };

  const namedUsers: Record<string, typeof userRoster> = {
    "AG-1042": [userRoster[0]!, userRoster[2]!],
    "AG-1108": [userRoster[1]!],
  };
  const sampleBalances = [4200, 8600, 1500, 22000];
  const users =
    record.users === 0
      ? []
      : (namedUsers[record.id] ?? [
          {
            id: `USR-${record.id.slice(3)}`,
            name: `User ${record.id.slice(3)}`,
            status: "active" as const,
            balance: sampleBalances[index % sampleBalances.length]!,
            openBets: 1,
            lastLoginAt: "2026-09-27T12:00:00.000Z",
          },
        ]).map((person) => ({
          id: person.id,
          name: person.name,
          status: person.status,
          balance: money(person.balance * 100),
          openBets: person.openBets,
          lastLoginAt: person.lastLoginAt,
        }));

  const bets =
    record.turnoverMinor === 0
      ? []
      : (record.id === "AG-1042" ? [betRoster[0]!, betRoster[2]!] : [betRoster[index % betRoster.length]!]).map(
          (bet, offset) => ({
            id: record.id === "AG-1042" ? bet.id : `BET-${record.id.slice(3)}${offset + 1}`,
            event: bet.event,
            market: bet.market,
            stake: money(bet.stake * 100),
            status: bet.status,
            placedAt: bet.placedAt,
          }),
        );

  const transactions = [
    ...(record.commissionMinor > 0
      ? [
          {
            id: `TXN-${record.id}-01`,
            type: "Commission credit",
            direction: "credit" as const,
            amount: money(record.commissionMinor),
            status: "posted",
            reference: `COM-${record.id}`,
            createdAt: "2026-09-28T08:05:00.000Z",
          },
        ]
      : []),
    ...(record.heldMinor > 0
      ? [
          {
            id: `TXN-${record.id}-02`,
            type: "Held amount",
            direction: "debit" as const,
            amount: money(record.heldMinor),
            status: "posted",
            reference: `HLD-${record.id}`,
            createdAt: "2026-09-27T18:10:00.000Z",
          },
        ]
      : []),
  ];

  const series = performanceSeries[record.id] ?? [];

  return {
    ok: true,
    data: agentDetailSchema.parse({
      source: "mock",
      generatedAt: revisedAt,
      agent: toListItem(record),
      wallet: (() => {
        const balances = ownerWalletBalances("agent", record.id);
        return {
          balance: money(balances?.availableMinor ?? record.balanceMinor),
          held: money(balances?.heldMinor ?? record.heldMinor),
          commission: money(record.commissionMinor),
        };
      })(),
      users,
      bets,
      transactions,
      performance: series.map(([date, turnover, ggr]) => ({
        date,
        turnover: money(turnover * 100),
        ggr: money(ggr * 100),
      })),
      reports: [
        {
          id: `${record.id}-today`,
          title: "Desk turnover",
          period: "Today",
          turnover: money(record.turnoverMinor),
          ggr: money(record.ggrMinor),
        },
        {
          id: `${record.id}-month`,
          title: "Desk turnover",
          period: "Month to date",
          turnover: money(record.monthTurnoverMinor),
          ggr: money(record.monthGgrMinor),
        },
      ],
      activity: [
        {
          id: `${record.id}-opened`,
          title: "Desk opened",
          detail: `${record.contactName} · ${record.username}`,
          at: record.createdAt,
        },
        ...record.events,
      ],
    }),
  };
}

export function createAgentRecord(input: CreateAgentInput): ServiceOk<AgentDetail> | ServiceError {
  const message = duplicate(input);
  if (message) return { ok: false, code: "CONFLICT", message };
  let id = `AG-${String(sequence).padStart(4, "0")}`;
  while (agents.some((agent) => agent.id === id)) {
    sequence += 1;
    id = `AG-${String(sequence).padStart(4, "0")}`;
  }
  sequence += 1;
  const createdAt = new Date().toISOString();
  agents.push({
    id,
    name: input.name,
    contactName: input.contactName,
    username: input.username,
    email: input.email,
    phone: input.phone,
    status: "pending",
    users: 0,
    activeUsers: 0,
    balanceMinor: 0,
    turnoverMinor: 0,
    ggrMinor: 0,
    commissionMinor: 0,
    exposureMinor: 0,
    heldMinor: 0,
    monthTurnoverMinor: 0,
    monthGgrMinor: 0,
    shareBps: 0,
    activity: "quiet",
    createdAt,
    events: [
      {
        id: `evt_${randomBytes(4).toString("hex")}`,
        title: "Agent submitted",
        detail: "Opened as pending. No balance was assigned.",
        at: createdAt,
      },
    ],
  });
  touch();
  const created = getAgentRecord(id);
  if (!created.ok) return created;
  return created;
}

export function updateAgentRecord(
  agentId: string,
  input: UpdateAgentInput,
): ServiceOk<AgentDetail> | ServiceError {
  const record = agents.find((agent) => agent.id === agentId);
  if (!record) return { ok: false, code: "NOT_FOUND", message: "That agent was not found." };
  const message = duplicate({ ...input, username: record.username }, agentId);
  if (message) return { ok: false, code: "CONFLICT", message };
  record.name = input.name;
  record.contactName = input.contactName;
  record.email = input.email;
  record.phone = input.phone;
  record.events.unshift({
    id: `evt_${randomBytes(4).toString("hex")}`,
    title: "Profile updated",
    detail: "Contact details were saved. Balances were not changed.",
    at: new Date().toISOString(),
  });
  touch();
  const updated = getAgentRecord(agentId);
  if (!updated.ok) return updated;
  return updated;
}

export function changeAgentStatus(
  agentId: string,
  change: AgentStatusChange,
): ServiceOk<AgentDetail> | ServiceError {
  const record = agents.find((agent) => agent.id === agentId);
  if (!record) return { ok: false, code: "NOT_FOUND", message: "That agent was not found." };
  const next = nextAgentStatus(record.status, change.action);
  if (!next) {
    return {
      ok: false,
      code: "CONFLICT",
      message:
        change.action === "suspend"
          ? "Only an active agent can be suspended."
          : "This agent is already active.",
    };
  }
  record.status = next;
  record.events.unshift({
    id: `evt_${randomBytes(4).toString("hex")}`,
    title: change.action === "suspend" ? "Agent suspended" : "Agent activated",
    detail: change.reason.length > 0 ? change.reason : "Activated by operations.",
    at: new Date().toISOString(),
  });
  touch();
  const updated = getAgentRecord(agentId);
  if (!updated.ok) return updated;
  return updated;
}

export function agentSearchHits() {
  return agents.map((agent) => ({
    id: agent.id,
    type: "agent" as const,
    title: agent.name,
    subtitle: `${agent.id} · ${agent.contactName}`,
    href: `/agents/${agent.id}`,
  }));
}
