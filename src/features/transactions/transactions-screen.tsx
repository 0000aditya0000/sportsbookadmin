"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { MetricCard } from "@/components/display/metric-card";
import { MoneyDisplay } from "@/components/display/money-display";
import { FilterBar } from "@/components/forms/filter-bar";
import { PageHeader } from "@/components/layout/page-header";
import { QueryFailure } from "@/components/states/feedback-states";
import { createDataColumns, DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionStatusBadge } from "@/features/finance/finance-status-badges";
import { TransactionRowMenu } from "@/features/transactions/transaction-row-menu";
import { useTransactionParams } from "@/hooks/use-transaction-params";
import { listTransactions } from "@/lib/api/transactions";
import { formatCount, formatDateTime } from "@/lib/format";
import type { TransactionListItem } from "@/lib/validation/transactions";

const helper = createDataColumns<TransactionListItem>();
const EMPTY_ROWS: TransactionListItem[] = [];
const HIDDEN_COLUMNS = ["walletId"];

const createdPresets = [
  { value: "all", label: "Any date", hint: "All created dates" },
  { value: "7d", label: "7 days", hint: "Created in the last 7 days" },
  { value: "30d", label: "30 days", hint: "Created in the last 30 days" },
  { value: "90d", label: "90 days", hint: "Created in the last 90 days" },
];

export function TransactionsScreen() {
  const params = useTransactionParams();
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);
  const listQuery = {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    status: params.status,
    type: params.type,
    flow: params.flow,
    agent: params.agent,
    created: params.created,
    sort: params.sort,
    direction: params.direction,
  } as const;

  const query = useQuery({
    queryKey: ["transactions", listQuery],
    queryFn: () => listTransactions(listQuery),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("id", {
          id: "id",
          header: "Transaction",
          enableSorting: false,
          cell: (info) => (
            <Link href={`/transactions/${info.getValue()}`} className="font-mono text-[12px] hover:underline">
              {info.getValue()}
            </Link>
          ),
        }),
        helper.accessor("type", {
          id: "type",
          header: "Type",
          cell: (info) => <span className="uppercase">{info.getValue().split("_").join(" ")}</span>,
        }),
        helper.accessor("userName", {
          id: "user",
          header: "User",
          enableSorting: false,
          cell: (info) => {
            const row = info.row.original;
            return canViewUser ? (
              <Link href={`/users/${row.userId}`} className="hover:underline">
                {row.userName}
              </Link>
            ) : (
              <span>{row.userName}</span>
            );
          },
        }),
        helper.accessor("agentName", {
          id: "agent",
          header: "Agent",
          enableSorting: false,
          cell: (info) => {
            const row = info.row.original;
            return canViewAgent ? (
              <Link href={`/agents/${row.agentId}`} className="hover:underline">
                {row.agentName}
              </Link>
            ) : (
              <span>{row.agentName}</span>
            );
          },
        }),
        helper.accessor("flow", {
          id: "flow",
          header: "Flow",
          enableSorting: false,
          cell: (info) => <span className="uppercase">{info.getValue()}</span>,
        }),
        helper.accessor("amount", {
          id: "amount",
          header: "Amount",
          cell: (info) => <MoneyDisplay money={info.getValue()} />,
        }),
        helper.accessor("status", {
          id: "status",
          header: "Status",
          cell: (info) => <TransactionStatusBadge status={info.getValue()} />,
        }),
        helper.accessor("reference", {
          id: "reference",
          header: "Reference",
          enableSorting: false,
          cell: (info) => <span className="font-mono text-[12px]">{info.getValue()}</span>,
        }),
        helper.accessor("walletId", {
          id: "walletId",
          header: "Wallet",
          enableSorting: false,
          cell: (info) => <span className="font-mono text-[12px]">{info.getValue()}</span>,
        }),
        helper.accessor("createdAt", {
          id: "createdAt",
          header: "Created",
          cell: (info) => (
            <span className="font-mono text-[12px] text-muted-foreground">{formatDateTime(info.getValue())}</span>
          ),
        }),
        helper.display({
          id: "actions",
          header: "Actions",
          enableSorting: false,
          cell: (info) => <TransactionRowMenu transaction={info.row.original} />,
        }),
      ]),
    [canViewAgent, canViewUser],
  );

  const snapshot = query.data?.data;
  const rows = snapshot?.items ?? EMPTY_ROWS;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Transactions"
        description="Monitor wallet movements across users and agents."
        meta={
          snapshot ? (
            <span className="font-mono">
              Snapshot {formatDateTime(snapshot.generatedAt)} · {snapshot.source}
            </span>
          ) : null
        }
      />
      {query.isError && !snapshot ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="Transactions could not be loaded." />
      ) : null}
      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Transaction feed snapshot. Volumes are service fixtures and are not recalculated in the UI.</span>
        </div>
      ) : null}
      {!snapshot && query.isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : null}
      {snapshot ? (
        <>
          <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-3" aria-label="Transaction summary">
            <MetricCard label="Total" value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.total)}</span>} hint="On this feed" />
            <MetricCard label="Posted" value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.posted)}</span>} />
            <MetricCard label="Pending" value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.pending)}</span>} />
            <MetricCard label="Failed" value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.failed)}</span>} />
            <MetricCard label="Credit volume" value={<MoneyDisplay money={snapshot.summary.creditVolume} display="kpi" />} hint="Service snapshot" />
            <MetricCard label="Debit volume" value={<MoneyDisplay money={snapshot.summary.debitVolume} display="kpi" />} hint="Service snapshot" />
          </section>
          <FilterBar
            search={params.q}
            onSearch={(value) => params.update({ q: value.trim() ? value : null, page: null })}
            searchPlaceholder="Search transaction, user, agent, or reference"
            searchLabel="Search transactions"
            status={params.status}
            statusOptions={[
              { value: "all", label: "Any" },
              { value: "posted", label: "Posted" },
              { value: "pending", label: "Pending" },
              { value: "failed", label: "Failed" },
            ]}
            onStatus={(value) => params.update({ status: value === "all" ? null : value, page: null })}
            range={params.created}
            rangePresets={createdPresets}
            onRange={(value) => params.update({ created: value === "all" ? null : value, page: null })}
          >
            <Combobox
              label="Type"
              value={params.type}
              options={[
                { value: "all", label: "Any" },
                { value: "deposit", label: "Deposit" },
                { value: "withdrawal", label: "Withdrawal" },
                { value: "bet_stake", label: "Bet stake" },
                { value: "bet_settlement", label: "Bet settlement" },
                { value: "hold", label: "Hold" },
                { value: "release", label: "Release" },
                { value: "adjustment", label: "Adjustment" },
                { value: "commission", label: "Commission" },
              ]}
              onChange={(value) => params.update({ type: value === "all" ? null : value, page: null })}
            />
            <Combobox
              label="Flow"
              value={params.flow}
              options={[
                { value: "all", label: "Any" },
                { value: "credit", label: "Credit" },
                { value: "debit", label: "Debit" },
              ]}
              onChange={(value) => params.update({ flow: value === "all" ? null : value, page: null })}
            />
            <Combobox
              label="Agent"
              value={params.agent}
              options={[
                { value: "all", label: "Any" },
                ...snapshot.agents.map((agent) => ({ value: agent.id, label: agent.name })),
              ]}
              onChange={(value) => params.update({ agent: value === "all" ? null : value, page: null })}
            />
          </FilterBar>
          <DataTable
            columns={columns}
            data={rows}
            caption="Wallet transactions"
            toolbarLabel="Transactions"
            hiddenColumnIds={HIDDEN_COLUMNS}
            pageSizeOptions={[10, 20]}
            page={snapshot.page}
            pageSize={snapshot.pageSize}
            total={snapshot.total}
            sort={{ id: params.sort, desc: params.direction === "desc" }}
            onSortChange={(sort) => {
              if (!sort) return;
              params.update({
                sort: sort.id === "createdAt" ? null : sort.id,
                direction: sort.desc ? null : "asc",
                page: null,
              });
            }}
            onPageChange={(page) => params.update({ page: page <= 1 ? null : String(page) })}
            onPageSizeChange={(pageSize) =>
              params.update({ pageSize: pageSize === 10 ? null : String(pageSize), page: null })
            }
            isLoading={query.isFetching}
            onRetry={() => void query.refetch()}
            emptyTitle="No transactions found"
            emptyDescription="Try changing your search or filters."
          />
        </>
      ) : null}
    </div>
  );
}
