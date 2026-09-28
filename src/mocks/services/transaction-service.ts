import "server-only";

import type { Money } from "@/lib/format";
import type { SearchResult } from "@/lib/validation/search";
import {
  transactionDetailSchema,
  transactionListResponseSchema,
  type TransactionDetail,
  type TransactionListQuery,
  type TransactionListResponse,
} from "@/lib/validation/transactions";
import {
  FINANCE_AS_OF,
  seedTransactions,
  transactionSummaryFixture,
  type TransactionRecord,
} from "@/mocks/data/finance";
import { queryTransactions } from "@/mocks/transaction-query";

type ServiceError = { ok: false; code: "NOT_FOUND"; message: string };
type ServiceOk<T> = { ok: true; data: T };

function money(amountMinor: number): Money {
  return { amountMinor, currency: "INR" };
}

const transactions: TransactionRecord[] = seedTransactions.map((item) => ({ ...item }));

function toItem(item: TransactionRecord) {
  return {
    id: item.id,
    userId: item.userId,
    userName: item.userName,
    agentId: item.agentId,
    agentName: item.agentName,
    walletId: item.walletId,
    type: item.type,
    flow: item.direction,
    amount: money(item.amountMinor),
    status: item.status,
    reference: item.reference,
    createdAt: item.createdAt,
  };
}

function agents() {
  return [
    ...new Map(transactions.map((item) => [item.agentId, { id: item.agentId, name: item.agentName }])).values(),
  ].sort((left, right) => left.name.localeCompare(right.name));
}

export function listTransactionRecords(query: TransactionListQuery): TransactionListResponse {
  const result = queryTransactions(transactions, query);
  const summary = transactionSummaryFixture;
  return transactionListResponseSchema.parse({
    source: "mock",
    generatedAt: FINANCE_AS_OF,
    summary: {
      total: summary.total,
      posted: summary.posted,
      pending: summary.pending,
      failed: summary.failed,
      creditVolume: money(summary.creditVolumeMinor),
      debitVolume: money(summary.debitVolumeMinor),
    },
    agents: agents(),
    items: result.items.map(toItem),
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
}

export function getTransactionRecord(transactionId: string): ServiceOk<TransactionDetail> | ServiceError {
  const item = transactions.find((entry) => entry.id === transactionId);
  if (!item) return { ok: false, code: "NOT_FOUND", message: "That transaction was not found." };
  return {
    ok: true,
    data: transactionDetailSchema.parse({
      source: "mock",
      generatedAt: FINANCE_AS_OF,
      transaction: toItem(item),
    }),
  };
}

export function transactionSearchHits(): SearchResult[] {
  return transactions.map((item) => ({
    id: item.id,
    type: "transaction" as const,
    title: `${item.type.split("_").join(" ")} · ${item.userName}`,
    subtitle: `${item.id} · ${item.reference}`,
    href: `/transactions/${item.id}`,
  }));
}
