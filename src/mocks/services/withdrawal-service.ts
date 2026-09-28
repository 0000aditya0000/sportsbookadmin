import "server-only";

import type { Money } from "@/lib/format";
import type { SearchResult } from "@/lib/validation/search";
import {
  withdrawalDetailSchema,
  withdrawalListResponseSchema,
  type WithdrawalDetail,
  type WithdrawalListQuery,
  type WithdrawalListResponse,
  type WithdrawalStatusChange,
} from "@/lib/validation/withdrawals";
import {
  FINANCE_AS_OF,
  seedWithdrawals,
  withdrawalSummaryFixture,
  type WithdrawalRecord,
} from "@/mocks/data/finance";
import { nextWithdrawalStatus, queryWithdrawals } from "@/mocks/withdrawal-query";

type ServiceError = { ok: false; code: "NOT_FOUND" | "CONFLICT"; message: string };
type ServiceOk<T> = { ok: true; data: T };

function money(amountMinor: number): Money {
  return { amountMinor, currency: "INR" };
}

const withdrawals: WithdrawalRecord[] = seedWithdrawals.map((item) => ({ ...item }));
let revisedAt = FINANCE_AS_OF;

function toItem(item: WithdrawalRecord) {
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
    ...new Map(withdrawals.map((item) => [item.agentId, { id: item.agentId, name: item.agentName }])).values(),
  ].sort((left, right) => left.name.localeCompare(right.name));
}

export function listWithdrawalRecords(query: WithdrawalListQuery): WithdrawalListResponse {
  const result = queryWithdrawals(withdrawals, query);
  const summary = withdrawalSummaryFixture;
  return withdrawalListResponseSchema.parse({
    source: "mock",
    generatedAt: revisedAt,
    summary: {
      total: summary.total,
      pending: summary.pending,
      approved: summary.approved,
      rejected: summary.rejected,
      paid: summary.paid,
      pendingAmount: money(summary.pendingAmountMinor),
      paidAmount: money(summary.paidAmountMinor),
    },
    agents: agents(),
    items: result.items.map(toItem),
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
}

export function getWithdrawalRecord(withdrawalId: string): ServiceOk<WithdrawalDetail> | ServiceError {
  const item = withdrawals.find((entry) => entry.id === withdrawalId);
  if (!item) return { ok: false, code: "NOT_FOUND", message: "That withdrawal was not found." };
  return {
    ok: true,
    data: withdrawalDetailSchema.parse({
      source: "mock",
      generatedAt: revisedAt,
      withdrawal: toItem(item),
    }),
  };
}

export function changeWithdrawalStatus(
  withdrawalId: string,
  change: WithdrawalStatusChange,
): ServiceOk<{ withdrawal: WithdrawalDetail["withdrawal"] }> | ServiceError {
  const index = withdrawals.findIndex((entry) => entry.id === withdrawalId);
  if (index < 0) return { ok: false, code: "NOT_FOUND", message: "That withdrawal was not found." };
  const current = withdrawals[index]!;
  const next = nextWithdrawalStatus(current.status, change.action);
  if (!next) {
    return { ok: false, code: "CONFLICT", message: "Only pending withdrawals can be reviewed." };
  }
  const updated: WithdrawalRecord = {
    ...current,
    status: next,
    reason: change.action === "reject" ? change.reason : current.reason,
    updatedAt: FINANCE_AS_OF,
  };
  withdrawals[index] = updated;
  revisedAt = FINANCE_AS_OF;
  return { ok: true, data: { withdrawal: toItem(updated) } };
}

export function withdrawalSearchHits(): SearchResult[] {
  return withdrawals.map((item) => ({
    id: item.id,
    type: "withdrawal" as const,
    title: `${item.userName} · ${item.status}`,
    subtitle: `${item.id} · ${item.providerReference}`,
    href: `/withdrawals/${item.id}`,
  }));
}
