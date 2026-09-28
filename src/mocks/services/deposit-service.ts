import "server-only";

import type { Money } from "@/lib/format";
import type { SearchResult } from "@/lib/validation/search";
import {
  depositDetailSchema,
  depositListResponseSchema,
  type DepositDetail,
  type DepositListQuery,
  type DepositListResponse,
  type DepositStatusChange,
} from "@/lib/validation/deposits";
import {
  depositSummaryFixture,
  FINANCE_AS_OF,
  seedDeposits,
  type DepositRecord,
} from "@/mocks/data/finance";
import { nextDepositStatus, queryDeposits } from "@/mocks/deposit-query";

type ServiceError = { ok: false; code: "NOT_FOUND" | "CONFLICT"; message: string };
type ServiceOk<T> = { ok: true; data: T };

function money(amountMinor: number): Money {
  return { amountMinor, currency: "INR" };
}

const deposits: DepositRecord[] = seedDeposits.map((item) => ({ ...item }));
let revisedAt = FINANCE_AS_OF;

function toItem(item: DepositRecord) {
  return {
    id: item.id,
    userId: item.userId,
    userName: item.userName,
    agentId: item.agentId,
    agentName: item.agentName,
    amount: money(item.amountMinor),
    status: item.status,
    method: item.method,
    providerReference: item.providerReference,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    reason: item.reason,
  };
}

function agents() {
  return [
    ...new Map(deposits.map((item) => [item.agentId, { id: item.agentId, name: item.agentName }])).values(),
  ].sort((left, right) => left.name.localeCompare(right.name));
}

export function listDepositRecords(query: DepositListQuery): DepositListResponse {
  const result = queryDeposits(deposits, query);
  const summary = depositSummaryFixture;
  return depositListResponseSchema.parse({
    source: "mock",
    generatedAt: revisedAt,
    summary: {
      total: summary.total,
      pending: summary.pending,
      completed: summary.completed,
      rejected: summary.rejected,
      reversed: summary.reversed,
      pendingAmount: money(summary.pendingAmountMinor),
      completedAmount: money(summary.completedAmountMinor),
    },
    agents: agents(),
    items: result.items.map(toItem),
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
}

export function getDepositRecord(depositId: string): ServiceOk<DepositDetail> | ServiceError {
  const item = deposits.find((entry) => entry.id === depositId);
  if (!item) return { ok: false, code: "NOT_FOUND", message: "That deposit was not found." };
  return {
    ok: true,
    data: depositDetailSchema.parse({
      source: "mock",
      generatedAt: revisedAt,
      deposit: toItem(item),
    }),
  };
}

export function changeDepositStatus(
  depositId: string,
  change: DepositStatusChange,
): ServiceOk<{ deposit: DepositDetail["deposit"] }> | ServiceError {
  const index = deposits.findIndex((entry) => entry.id === depositId);
  if (index < 0) return { ok: false, code: "NOT_FOUND", message: "That deposit was not found." };
  const current = deposits[index]!;
  const next = nextDepositStatus(current.status, change.action);
  if (!next) {
    return { ok: false, code: "CONFLICT", message: "Only pending deposits can be reviewed." };
  }
  const updated: DepositRecord = {
    ...current,
    status: next,
    reason: change.action === "reject" ? change.reason : current.reason,
    updatedAt: FINANCE_AS_OF,
  };
  deposits[index] = updated;
  revisedAt = FINANCE_AS_OF;
  return { ok: true, data: { deposit: toItem(updated) } };
}

export function depositSearchHits(): SearchResult[] {
  return deposits.map((item) => ({
    id: item.id,
    type: "deposit" as const,
    title: `${item.userName} · ${item.status}`,
    subtitle: `${item.id} · ${item.providerReference}`,
    href: `/deposits/${item.id}`,
  }));
}
