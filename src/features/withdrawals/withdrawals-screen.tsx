"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
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
import { WithdrawalStatusBadge } from "@/features/finance/finance-status-badges";
import { WithdrawalRowMenu } from "@/features/withdrawals/withdrawal-row-menu";
import { WithdrawalStatusDialog } from "@/features/withdrawals/withdrawal-status-dialog";
import { useWithdrawalParams } from "@/hooks/use-withdrawal-params";
import { listWithdrawals } from "@/lib/api/payments";
import { formatCount, formatDateTime } from "@/lib/format";
import type { WithdrawalListItem, WithdrawalStatusChange } from "@/lib/validation/withdrawals";

const helper = createDataColumns<WithdrawalListItem>();
const EMPTY_ROWS: WithdrawalListItem[] = [];

const createdPresets = [
  { value: "all", label: "Any date", hint: "All created dates" },
  { value: "7d", label: "7 days", hint: "Created in the last 7 days" },
  { value: "30d", label: "30 days", hint: "Created in the last 30 days" },
  { value: "90d", label: "90 days", hint: "Created in the last 90 days" },
];

export function WithdrawalsScreen() {
  const params = useWithdrawalParams();
  const queryClient = useQueryClient();
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);
  const [statusTarget, setStatusTarget] = useState<{
    withdrawal: WithdrawalListItem;
    action: WithdrawalStatusChange["action"];
  } | null>(null);

  const listQuery = {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    status: params.status,
    agent: params.agent,
    method: params.method,
    created: params.created,
    sort: params.sort,
    direction: params.direction,
  } as const;

  const query = useQuery({
    queryKey: ["withdrawals", listQuery],
    queryFn: () => listWithdrawals(listQuery),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("id", {
          id: "id",
          header: "Withdrawal",
          enableSorting: false,
          cell: (info) => (
            <Link href={`/withdrawals/${info.getValue()}`} className="font-mono text-[12px] hover:underline">
              {info.getValue()}
            </Link>
          ),
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
        helper.accessor("amount", {
          id: "amount",
          header: "Amount",
          cell: (info) => <MoneyDisplay money={info.getValue()} />,
        }),
        helper.accessor("method", {
          id: "method",
          header: "Method",
          enableSorting: false,
        }),
        helper.accessor("status", {
          id: "status",
          header: "Status",
          cell: (info) => <WithdrawalStatusBadge status={info.getValue()} />,
        }),
        helper.accessor("providerReference", {
          id: "reference",
          header: "Reference",
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
        helper.accessor("updatedAt", {
          id: "updatedAt",
          header: "Updated",
          cell: (info) => (
            <span className="font-mono text-[12px] text-muted-foreground">{formatDateTime(info.getValue())}</span>
          ),
        }),
        helper.display({
          id: "actions",
          header: "Actions",
          enableSorting: false,
          cell: (info) => (
            <WithdrawalRowMenu
              withdrawal={info.row.original}
              onStatus={(withdrawal, action) => setStatusTarget({ withdrawal, action })}
            />
          ),
        }),
      ]),
    [canViewAgent, canViewUser],
  );

  const snapshot = query.data?.data;
  const rows = snapshot?.items ?? EMPTY_ROWS;

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Withdrawals"
        description="Review outbound withdrawal requests and payout decisions."
        meta={
          snapshot ? (
            <span className="font-mono">
              Snapshot {formatDateTime(snapshot.generatedAt)} · {snapshot.source}
            </span>
          ) : null
        }
      />
      {query.isError && !snapshot ? (
        <QueryFailure
          error={query.error}
          onRetry={() => void query.refetch()}
          fallback="Withdrawals could not be loaded."
        />
      ) : null}
      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Withdrawal queue snapshot. Summary amounts are service fixtures and are not recalculated in the UI.</span>
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
          <section
            className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Withdrawal summary"
          >
            <MetricCard
              label="Total"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.total)}</span>}
              hint="On this feed"
            />
            <MetricCard
              label="Pending"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.pending)}</span>}
            />
            <MetricCard
              label="Approved"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.approved)}</span>}
            />
            <MetricCard
              label="Rejected"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.rejected)}</span>}
            />
            <MetricCard
              label="Paid"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.paid)}</span>}
            />
            <MetricCard
              label="Pending amount"
              value={<MoneyDisplay money={snapshot.summary.pendingAmount} display="kpi" />}
              hint="Service snapshot"
            />
            <MetricCard
              label="Paid amount"
              value={<MoneyDisplay money={snapshot.summary.paidAmount} display="kpi" />}
              hint="Service snapshot"
            />
          </section>
          <FilterBar
            search={params.q}
            onSearch={(value) => params.update({ q: value.trim() ? value : null, page: null })}
            searchPlaceholder="Search withdrawal, user, agent, or reference"
            searchLabel="Search withdrawals"
            status={params.status}
            statusOptions={[
              { value: "all", label: "Any" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "paid", label: "Paid" },
              { value: "failed", label: "Failed" },
            ]}
            onStatus={(value) => params.update({ status: value === "all" ? null : value, page: null })}
            range={params.created}
            rangePresets={createdPresets}
            onRange={(value) => params.update({ created: value === "all" ? null : value, page: null })}
          >
            <Combobox
              label="Method"
              value={params.method}
              options={[
                { value: "all", label: "Any" },
                { value: "UPI", label: "UPI" },
                { value: "Bank transfer", label: "Bank transfer" },
              ]}
              onChange={(value) => params.update({ method: value === "all" ? null : value, page: null })}
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
            caption="Withdrawal requests"
            toolbarLabel="Withdrawals"
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
            emptyTitle="No withdrawals found"
            emptyDescription="Try changing your search or filters."
          />
        </>
      ) : null}
      {statusTarget ? (
        <WithdrawalStatusDialog
          key={`${statusTarget.withdrawal.id}-${statusTarget.action}`}
          withdrawal={statusTarget.withdrawal}
          action={statusTarget.action}
          onOpenChange={(open) => {
            if (!open) setStatusTarget(null);
          }}
          onCompleted={refresh}
        />
      ) : null}
    </div>
  );
}
