"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { CopyButton } from "@/components/display/copy-button";
import { MetricCard } from "@/components/display/metric-card";
import { MoneyDisplay } from "@/components/display/money-display";
import { FilterBar } from "@/components/forms/filter-bar";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, QueryFailure } from "@/components/states/feedback-states";
import { createDataColumns, DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletRowMenu } from "@/features/wallet/wallet-row-menu";
import { WalletStatusBadge } from "@/features/wallet/wallet-status-badge";
import { useWalletParams } from "@/hooks/use-wallet-params";
import { listWallets } from "@/lib/api/wallet";
import { formatCount, formatDateTime } from "@/lib/format";
import type { WalletListItem } from "@/lib/validation/wallet";

const helper = createDataColumns<WalletListItem>();
const EMPTY_ROWS: WalletListItem[] = [];
const HIDDEN_COLUMNS = ["totalBalance", "createdAt"];

const createdPresets = [
  { value: "all", label: "Any date", hint: "All created dates" },
  { value: "7d", label: "7 days", hint: "Created in the last 7 days" },
  { value: "30d", label: "30 days", hint: "Created in the last 30 days" },
  { value: "90d", label: "90 days", hint: "Created in the last 90 days" },
];

export function WalletScreen() {
  const params = useWalletParams();
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);

  const listQuery = {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    type: params.type,
    status: params.status,
    agent: params.agent,
    balance: params.balance,
    activity: params.activity,
    created: params.created,
    sort: params.sort,
    direction: params.direction,
  } as const;

  const query = useQuery({
    queryKey: ["wallet", listQuery],
    queryFn: () => listWallets(listQuery),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("walletId", {
          id: "account",
          header: "Account",
          enableSorting: false,
          cell: (info) => {
            const account = info.row.original;
            const href =
              account.ownerType === "user" && canViewUser
                ? `/users/${account.ownerId}?tab=wallet`
                : account.ownerType === "agent" && canViewAgent
                  ? `/agents/${account.ownerId}?tab=wallet`
                  : null;
            return (
              <div className="min-w-44">
                {href ? (
                  <Link href={href} className="inline-flex items-center gap-1 font-mono text-[12px] hover:underline">
                    {account.walletId}
                  </Link>
                ) : (
                  <span className="font-mono text-[12px]">{account.walletId}</span>
                )}
                <CopyButton value={account.walletId} label={`Copy ${account.walletId}`} />
              </div>
            );
          },
        }),
        helper.accessor("ownerType", {
          id: "type",
          header: "Type",
          enableSorting: false,
          cell: (info) => <span className="uppercase">{info.getValue()}</span>,
        }),
        helper.accessor("ownerName", {
          id: "owner",
          header: "Owner",
          cell: (info) => {
            const account = info.row.original;
            return (
              <div className="min-w-36">
                <p className="font-medium">{account.ownerName}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{account.ownerId}</p>
              </div>
            );
          },
        }),
        helper.display({
          id: "agent",
          header: "Agent",
          enableSorting: false,
          cell: (info) => {
            const account = info.row.original;
            if (!account.agentId || !account.agentName) return <span className="text-muted-foreground">—</span>;
            return canViewAgent ? (
              <Link href={`/agents/${account.agentId}`} className="hover:underline">
                {account.agentName}
              </Link>
            ) : (
              <span>{account.agentName}</span>
            );
          },
        }),
        helper.accessor("status", {
          id: "status",
          header: "Status",
          enableSorting: false,
          cell: (info) => <WalletStatusBadge status={info.getValue()} />,
        }),
        helper.accessor("availableBalance", {
          id: "availableBalance",
          header: "Available",
          cell: (info) => <MoneyDisplay money={info.getValue()} />,
        }),
        helper.accessor("heldBalance", {
          id: "heldBalance",
          header: "Held",
          cell: (info) => <MoneyDisplay money={info.getValue()} />,
        }),
        helper.accessor("totalBalance", {
          id: "totalBalance",
          header: "Total",
          cell: (info) => <MoneyDisplay money={info.getValue()} />,
        }),
        helper.accessor("lastActivityAt", {
          id: "lastActivity",
          header: "Last activity",
          cell: (info) => {
            const value = info.getValue();
            return (
              <span className="font-mono text-[12px] text-muted-foreground">
                {value ? formatDateTime(value) : "—"}
              </span>
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
        helper.display({
          id: "actions",
          header: "Actions",
          enableSorting: false,
          cell: (info) => <WalletRowMenu account={info.row.original} />,
        }),
      ]),
    [canViewAgent, canViewUser],
  );

  const snapshot = query.data?.data;
  const rows = snapshot?.items ?? EMPTY_ROWS;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Wallet"
        description="Monitor platform wallet balances, held funds and financial liability."
        meta={
          snapshot ? (
            <span className="font-mono">
              Snapshot {formatDateTime(snapshot.generatedAt)} · {snapshot.source}
            </span>
          ) : null
        }
      />

      {query.isError && !snapshot ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="Wallet could not be loaded." />
      ) : null}

      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Development financial snapshot. Summary figures are fixtures and are not reconciled to the dashboard or user book in the UI.</span>
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
            aria-label="Wallet position"
          >
            <MetricCard
              label="Total wallet balance"
              value={<MoneyDisplay money={snapshot.summary.totalBalance} display="kpi" />}
              hint="Service snapshot"
            />
            <MetricCard
              label="Available balance"
              value={<MoneyDisplay money={snapshot.summary.availableBalance} display="kpi" />}
              hint="Service snapshot"
            />
            <MetricCard
              label="Held balance"
              value={<MoneyDisplay money={snapshot.summary.heldBalance} display="kpi" />}
              hint="Service snapshot"
            />
            <MetricCard
              label="Wallet liability"
              value={<MoneyDisplay money={snapshot.summary.walletLiability} display="kpi" />}
              hint="Service snapshot"
            />
          </section>

          <section
            className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Balance distribution"
          >
            <MetricCard
              label="User wallets"
              value={<MoneyDisplay money={snapshot.summary.userWalletBalance} display="kpi" />}
              hint="Distribution from the service"
            />
            <MetricCard
              label="Agent wallets"
              value={<MoneyDisplay money={snapshot.summary.agentWalletBalance} display="kpi" />}
              hint="Distribution from the service"
            />
            <MetricCard
              label="Platform held"
              value={<MoneyDisplay money={snapshot.summary.platformHeld} display="kpi" />}
              hint="Distribution from the service"
            />
          </section>

          <section
            className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3"
            aria-label="Wallet account counts"
          >
            <MetricCard
              label="Active wallets"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.activeWallets)}</span>}
              hint="Status active"
            />
            <MetricCard
              label="Frozen wallets"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.frozenWallets)}</span>}
              hint="Status frozen"
            />
            <MetricCard
              label="Pending wallets"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.pendingWallets)}</span>}
              hint="Pending accounts"
            />
          </section>

          <FilterBar
            search={params.q}
            onSearch={(value) => params.update({ q: value.trim() ? value : null, page: null })}
            searchPlaceholder="Search wallet, user, or agent"
            searchLabel="Search wallets"
            status={params.status}
            statusOptions={[
              { value: "all", label: "Any" },
              { value: "active", label: "Active" },
              { value: "frozen", label: "Frozen" },
              { value: "suspended", label: "Suspended" },
              { value: "closed", label: "Closed" },
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
                { value: "user", label: "User" },
                { value: "agent", label: "Agent" },
                { value: "system", label: "System" },
              ]}
              onChange={(value) => params.update({ type: value === "all" ? null : value, page: null })}
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
            <Combobox
              label="Balance"
              value={params.balance}
              options={[
                { value: "all", label: "Any" },
                { value: "under_10k", label: "Under ₹10,000" },
                { value: "10k_1l", label: "₹10,000–₹1L" },
                { value: "over_1l", label: "Over ₹1L" },
                { value: "zero", label: "Zero" },
                { value: "negative", label: "Negative" },
              ]}
              onChange={(value) => params.update({ balance: value === "all" ? null : value, page: null })}
            />
            <Combobox
              label="Activity"
              value={params.activity}
              options={[
                { value: "all", label: "Any" },
                { value: "today", label: "Active today" },
                { value: "7d", label: "Recently active" },
                { value: "quiet", label: "No recent activity" },
              ]}
              onChange={(value) => params.update({ activity: value === "all" ? null : value, page: null })}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={rows}
            caption="Wallet accounts"
            toolbarLabel="Wallets"
            hiddenColumnIds={HIDDEN_COLUMNS}
            pageSizeOptions={[10, 20]}
            page={snapshot.page}
            pageSize={snapshot.pageSize}
            total={snapshot.total}
            sort={{ id: params.sort, desc: params.direction === "desc" }}
            onSortChange={(sort) => {
              if (!sort) return;
              params.update({
                sort: sort.id === "availableBalance" ? null : sort.id,
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
            emptyTitle="No wallets found"
            emptyDescription="Try changing your search or filters."
          />

          <EmptyState title="Recent activity" description={snapshot.activityMessage} />
        </>
      ) : null}
    </div>
  );
}
