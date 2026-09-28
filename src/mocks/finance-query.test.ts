import { expect, test } from "vitest";
import { PERMISSIONS, can } from "@/config/permissions";
import { formatMoney } from "@/lib/format";
import { depositIdSchema, depositListQuerySchema } from "@/lib/validation/deposits";
import { transactionIdSchema, transactionListQuerySchema } from "@/lib/validation/transactions";
import { withdrawalIdSchema, withdrawalListQuerySchema } from "@/lib/validation/withdrawals";
import {
  depositSummaryFixture,
  seedDeposits,
  seedTransactions,
  seedWithdrawals,
  transactionSummaryFixture,
  withdrawalSummaryFixture,
} from "@/mocks/data/finance";
import { nextDepositStatus, queryDeposits } from "@/mocks/deposit-query";
import { queryTransactions } from "@/mocks/transaction-query";
import { nextWithdrawalStatus, queryWithdrawals } from "@/mocks/withdrawal-query";

function transactions(overrides: Record<string, unknown> = {}) {
  return queryTransactions(seedTransactions, transactionListQuerySchema.parse(overrides));
}

function deposits(overrides: Record<string, unknown> = {}) {
  return queryDeposits(seedDeposits, depositListQuerySchema.parse(overrides));
}

function withdrawals(overrides: Record<string, unknown> = {}) {
  return queryWithdrawals(seedWithdrawals, withdrawalListQuerySchema.parse(overrides));
}

test("finance summary fixtures are explicit snapshots", () => {
  expect(transactionSummaryFixture.creditVolumeMinor).toBe(4_820_000_00);
  expect(transactionSummaryFixture.debitVolumeMinor).toBe(3_640_000_00);
  expect(depositSummaryFixture.pendingAmountMinor).toBe(4_62_000_00);
  expect(withdrawalSummaryFixture.paidAmountMinor).toBe(11_25_500_00);
  expect(formatMoney({ amountMinor: transactionSummaryFixture.creditVolumeMinor, currency: "INR" })).toBe(
    "₹48,20,000.00",
  );
});

test("transaction search, filters, sorting, and pagination stay on the service query", () => {
  expect(transactions({ q: "TXN-90001" }).items.map((item) => item.id)).toEqual(["TXN-90001"]);
  expect(transactions({ q: "East Desk" }).total).toBeGreaterThan(0);
  expect(transactions({ type: "deposit" }).items.every((item) => item.type === "deposit")).toBe(true);
  expect(transactions({ flow: "credit" }).items.every((item) => item.direction === "credit")).toBe(true);
  expect(transactions({ status: "pending" }).items.every((item) => item.status === "pending")).toBe(true);
  expect(transactions({ agent: "AG-1042" }).items.every((item) => item.agentId === "AG-1042")).toBe(true);
  const sorted = transactions({ sort: "amount", direction: "desc" });
  expect(sorted.items[0]?.amountMinor ?? 0).toBeGreaterThanOrEqual(sorted.items[1]?.amountMinor ?? 0);
  const page = transactions({ page: 2, pageSize: 10 });
  expect(page.items).toHaveLength(10);
  expect(page.total).toBe(seedTransactions.length);
  expect(transactionIdSchema.safeParse("TXN-90001").success).toBe(true);
  expect(transactionIdSchema.safeParse("bad").success).toBe(false);
  expect(can(["DASHBOARD_VIEW"], PERMISSIONS.TRANSACTION_VIEW)).toBe(false);
});

test("deposit search, filters, and status transitions stay on the service query", () => {
  expect(deposits({ q: "DEP-10021" }).items.map((item) => item.id)).toEqual(["DEP-10021"]);
  expect(deposits({ status: "pending" }).items.every((item) => item.status === "pending")).toBe(true);
  expect(deposits({ method: "UPI" }).items.every((item) => item.method === "UPI")).toBe(true);
  expect(deposits({ agent: "AG-1042" }).items.every((item) => item.agentId === "AG-1042")).toBe(true);
  expect(nextDepositStatus("pending", "approve")).toBe("completed");
  expect(nextDepositStatus("pending", "reject")).toBe("rejected");
  expect(nextDepositStatus("completed", "approve")).toBeNull();
  expect(depositIdSchema.safeParse("DEP-10021").success).toBe(true);
  expect(can(["DEPOSIT_VIEW"], PERMISSIONS.DEPOSIT_APPROVE)).toBe(false);
});

test("withdrawal search, filters, and status transitions stay on the service query", () => {
  expect(withdrawals({ q: "WD-19022" }).items.map((item) => item.id)).toEqual(["WD-19022"]);
  expect(withdrawals({ status: "pending" }).items.every((item) => item.status === "pending")).toBe(true);
  expect(withdrawals({ method: "Bank transfer" }).items.every((item) => item.method === "Bank transfer")).toBe(true);
  expect(nextWithdrawalStatus("pending", "approve")).toBe("approved");
  expect(nextWithdrawalStatus("pending", "reject")).toBe("rejected");
  expect(nextWithdrawalStatus("paid", "approve")).toBeNull();
  expect(withdrawalIdSchema.safeParse("WD-19022").success).toBe(true);
  expect(can(["WITHDRAWAL_VIEW"], PERMISSIONS.WITHDRAWAL_REJECT)).toBe(false);
});
