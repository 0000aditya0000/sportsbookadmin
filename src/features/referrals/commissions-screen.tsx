"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { CopyButton } from "@/components/display/copy-button";
import { MetricCard } from "@/components/display/metric-card";
import { MoneyDisplay } from "@/components/display/money-display";
import { PercentageDisplay } from "@/components/display/percentage-display";
import { FilterBar } from "@/components/forms/filter-bar";
import { PageHeader } from "@/components/layout/page-header";
import { QueryFailure } from "@/components/states/feedback-states";
import { createDataColumns, DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { CommissionDetailDrawer } from "@/features/referrals/commission-detail-drawer";
import { CommissionStatusBadge } from "@/features/referrals/referral-status-badges";
import { useCommissionParams } from "@/hooks/use-commission-params";
import { listReferralCommissions } from "@/lib/api/referrals";
import { formatCount, formatDateTime } from "@/lib/format";
import type { ReferralCommissionListItem } from "@/lib/validation/referrals";

const helper = createDataColumns<ReferralCommissionListItem>();
const EMPTY_ROWS: ReferralCommissionListItem[] = [];

const createdPresets = [
  { value: "all", label: "Any date", hint: "All created dates" },
  { value: "7d", label: "7 days", hint: "Created in the last 7 days" },
  { value: "30d", label: "30 days", hint: "Created in the last 30 days" },
  { value: "90d", label: "90 days", hint: "Created in the last 90 days" },
];

export function CommissionsScreen() {
  const params = useCommissionParams();
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const [detailId, setDetailId] = useState<string | null>(null);

  const listQuery = {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    beneficiary: params.beneficiary,
    betUser: params.betUser,
    betId: params.betId,
    level: params.level,
    agent: params.agent,
    status: params.status,
    created: params.created,
    sort: params.sort,
    direction: params.direction,
  } as const;

  const query = useQuery({
    queryKey: ["referral-commissions", listQuery],
    queryFn: () => listReferralCommissions(listQuery),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("id", {
          id: "id",
          header: "Commission ID",
          enableSorting: false,
          cell: (info) => (
            <span className="inline-flex items-center gap-1 font-mono text-[12px]">
              <button type="button" className="hover:underline" onClick={() => setDetailId(info.getValue())}>
                {info.getValue()}
              </button>
              <CopyButton value={info.getValue()} label={`Copy ${info.getValue()}`} />
            </span>
          ),
        }),
        helper.accessor("betId", {
          id: "betId",
          header: "Bet ID",
          enableSorting: false,
          cell: (info) => (
            <span className="inline-flex items-center gap-1 font-mono text-[12px]">
              {info.getValue()}
              <CopyButton value={info.getValue()} label={`Copy ${info.getValue()}`} />
            </span>
          ),
        }),
        helper.accessor("betUserName", {
          id: "betUser",
          header: "Bet user",
          enableSorting: false,
          cell: (info) => {
            const row = info.row.original;
            return canViewUser ? (
              <Link href={`/users/${row.betUserId}?tab=referrals`} className="hover:underline">
                {row.betUserName}
              </Link>
            ) : (
              <span>{row.betUserName}</span>
            );
          },
        }),
        helper.accessor("beneficiaryName", {
          id: "beneficiary",
          header: "Beneficiary",
          enableSorting: false,
          cell: (info) => {
            const row = info.row.original;
            return canViewUser ? (
              <Link href={`/users/${row.beneficiaryId}?tab=referrals`} className="hover:underline">
                {row.beneficiaryName}
              </Link>
            ) : (
              <span>{row.beneficiaryName}</span>
            );
          },
        }),
        helper.accessor("level", {
          id: "level",
          header: "Level",
          cell: (info) => `L${info.getValue()}`,
        }),
        helper.accessor("betAmount", {
          id: "betAmount",
          header: "Bet amount",
          cell: (info) => <MoneyDisplay money={info.getValue()} />,
        }),
        helper.accessor("appliedRatePercent", {
          id: "rate",
          header: "Applied rate",
          enableSorting: false,
          cell: (info) => <PercentageDisplay value={info.getValue()} />,
        }),
        helper.accessor("commissionAmount", {
          id: "commissionAmount",
          header: "Commission",
          cell: (info) => <MoneyDisplay money={info.getValue()} />,
        }),
        helper.accessor("status", {
          id: "status",
          header: "Status",
          cell: (info) => <CommissionStatusBadge status={info.getValue()} />,
        }),
        helper.accessor("ledgerTransactionId", {
          id: "ledger",
          header: "Ledger txn",
          enableSorting: false,
          cell: (info) => {
            const value = info.getValue();
            return value ? (
              <span className="inline-flex items-center gap-1 font-mono text-[12px]">
                {value}
                <CopyButton value={value} label={`Copy ${value}`} />
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            );
          },
        }),
        helper.accessor("createdAt", {
          id: "createdAt",
          header: "Created",
          cell: (info) => (
            <span className="font-mono text-[12px] text-muted-foreground">{formatDateTime(info.getValue())}</span>
          ),
        }),
      ]),
    [canViewUser],
  );

  const snapshot = query.data?.data;
  const rows = snapshot?.items ?? EMPTY_ROWS;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Referral Commission History"
        description="Inspect referral commissions generated from qualifying bets."
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
          fallback="Commission history could not be loaded."
        />
      ) : null}
      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>
            Applied rates are historical values from each commission record. They are not replaced by current configuration.
          </span>
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
            className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Commission summary"
          >
            <MetricCard
              label="Total"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.total)}</span>}
            />
            <MetricCard
              label="Posted"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.posted)}</span>}
            />
            <MetricCard
              label="Pending amount"
              value={<MoneyDisplay money={snapshot.summary.pendingAmount} display="kpi" />}
              hint="Service snapshot"
            />
            <MetricCard
              label="Posted amount"
              value={<MoneyDisplay money={snapshot.summary.postedAmount} display="kpi" />}
              hint="Service snapshot"
            />
          </section>
          <FilterBar
            search={params.q}
            onSearch={(value) => params.update({ q: value.trim() ? value : null, page: null })}
            searchPlaceholder="Search commission, bet, beneficiary, or ledger id"
            searchLabel="Search commissions"
            status={params.status}
            statusOptions={[
              { value: "all", label: "Any" },
              { value: "pending", label: "Pending" },
              { value: "posted", label: "Posted" },
              { value: "reversed", label: "Reversed" },
              { value: "failed", label: "Failed" },
            ]}
            onStatus={(value) => params.update({ status: value === "all" ? null : value, page: null })}
            range={params.created}
            rangePresets={createdPresets}
            onRange={(value) => params.update({ created: value === "all" ? null : value, page: null })}
          >
            <Combobox
              label="Level"
              value={params.level}
              options={[
                { value: "all", label: "All" },
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
                { value: "5", label: "5" },
                { value: "6", label: "6" },
              ]}
              onChange={(value) => params.update({ level: value === "all" ? null : value, page: null })}
            />
            <Combobox
              label="Agent owner"
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
            caption="Referral commissions"
            toolbarLabel="Commissions"
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
            emptyTitle="No commission records found"
            emptyDescription="Try changing your search or filters."
          />
        </>
      ) : null}
      {detailId ? (
        <CommissionDetailDrawer commissionId={detailId} onOpenChange={(open) => !open && setDetailId(null)} />
      ) : null}
    </div>
  );
}
