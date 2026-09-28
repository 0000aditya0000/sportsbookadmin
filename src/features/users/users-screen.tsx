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
import { UserAvatar } from "@/components/ui/avatar";
import { UserQuickView } from "@/features/users/user-quick-view";
import { UserRowMenu } from "@/features/users/user-row-menu";
import { UserSessionDialog } from "@/features/users/user-session-dialog";
import { UserStatusBadge } from "@/features/users/user-status-badge";
import { UserStatusDialog } from "@/features/users/user-status-dialog";
import { useUserParams } from "@/hooks/use-user-params";
import { listUsers } from "@/lib/api/users";
import { formatCount, formatDateTime } from "@/lib/format";
import type { UserListItem, UserStatusChange } from "@/lib/validation/users";

const helper = createDataColumns<UserListItem>();
const EMPTY_ROWS: UserListItem[] = [];
const HIDDEN_COLUMNS = ["id", "contact", "held", "totalBets", "ggr"];

const createdPresets = [
  { value: "all", label: "Any date", hint: "All registration dates" },
  { value: "7d", label: "7 days", hint: "Registered in the last 7 days" },
  { value: "30d", label: "30 days", hint: "Registered in the last 30 days" },
  { value: "90d", label: "90 days", hint: "Registered in the last 90 days" },
];

export function UsersScreen() {
  const params = useUserParams();
  const queryClient = useQueryClient();
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);
  const [quickView, setQuickView] = useState<UserListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    user: UserListItem;
    action: UserStatusChange["action"];
  } | null>(null);
  const [logoutTarget, setLogoutTarget] = useState<UserListItem | null>(null);

  const listQuery = {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    status: params.status,
    agent: params.agent,
    created: params.created,
    balance: params.balance,
    activity: params.activity,
    betting: params.betting,
    sort: params.sort,
    direction: params.direction,
  } as const;

  const query = useQuery({
    queryKey: ["users", listQuery],
    queryFn: () => listUsers(listQuery),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("id", {
          id: "id",
          header: "User ID",
          enableSorting: true,
          cell: (info) => <span className="font-mono text-[12px]">{info.getValue()}</span>,
        }),
        helper.accessor("displayName", {
          id: "name",
          header: "User",
          cell: (info) => {
            const user = info.row.original;
            return (
              <div className="flex min-w-40 items-center gap-2">
                <UserAvatar label={user.displayName} />
                <div className="min-w-0">
                  <Link href={`/users/${user.id}`} className="block truncate font-medium hover:underline">
                    {user.displayName}
                  </Link>
                  <p className="font-mono text-[11px] text-muted-foreground">{user.id}</p>
                </div>
              </div>
            );
          },
        }),
        helper.display({
          id: "contact",
          header: "Contact",
          enableSorting: false,
          cell: (info) => (
            <div className="min-w-36 text-xs">
              <p>{info.row.original.username}</p>
              <p className="text-muted-foreground">{info.row.original.phone}</p>
              <p className="text-muted-foreground">{info.row.original.email}</p>
            </div>
          ),
        }),
        helper.accessor("agentName", {
          id: "agent",
          header: "Agent",
          cell: (info) => {
            const user = info.row.original;
            const name = canViewAgent ? (
              <Link href={`/agents/${user.agentId}`} className="font-medium hover:underline">
                {user.agentName}
              </Link>
            ) : (
              <span className="font-medium">{user.agentName}</span>
            );
            return (
              <div>
                {name}
                <p className="font-mono text-[11px] text-muted-foreground">{user.agentId}</p>
              </div>
            );
          },
        }),
        helper.accessor("status", {
          id: "status",
          header: "Status",
          enableSorting: false,
          cell: (info) => <UserStatusBadge status={info.getValue()} />,
        }),
        helper.accessor("balance", {
          id: "balance",
          header: "Balance",
          cell: (info) => <MoneyDisplay money={info.getValue()} />,
        }),
        helper.accessor("openBets", {
          id: "openBets",
          header: "Open bets",
          cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
        }),
        helper.accessor("turnover", {
          id: "turnover",
          header: "Turnover",
          cell: (info) => <MoneyDisplay money={info.getValue()} />,
        }),
        helper.accessor("lastLoginAt", {
          id: "lastLogin",
          header: "Last login",
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
          cell: (info) => (
            <UserRowMenu
              user={info.row.original}
              onQuickView={setQuickView}
              onStatus={(user, action) => setStatusTarget({ user, action })}
              onLogout={setLogoutTarget}
            />
          ),
        }),
      ]),
    [canViewAgent],
  );

  const snapshot = query.data?.data;
  const rows = snapshot?.items ?? EMPTY_ROWS;

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["users"] });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Users"
        description="Manage platform users, account status, activity and operational access."
      />

      {query.isError && !snapshot ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="Users could not be loaded." />
      ) : null}

      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Mock user book. Figures are fixtures from the service, not production totals.</span>
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
            aria-label="User book"
          >
            <MetricCard
              label="Total users"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.total)}</span>}
              hint="Accounts on the book"
            />
            <MetricCard
              label="Active users"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.active)}</span>}
              hint="Status active"
            />
            <MetricCard
              label="Suspended users"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.suspended)}</span>}
              hint="Status suspended"
            />
            <MetricCard
              label="Banned users"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.banned)}</span>}
              hint={`${formatCount(snapshot.summary.locked)} locked`}
            />
            <MetricCard
              label="Users online"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.online)}</span>}
              hint="One active session each"
            />
            <MetricCard
              label="Total user balance"
              value={<MoneyDisplay money={snapshot.summary.balance} display="kpi" />}
              hint="Available balances from the service"
            />
          </section>

          <FilterBar
            search={params.q}
            onSearch={(value) => params.update({ q: value.trim() ? value : null, page: null })}
            searchPlaceholder="Search user, phone, email, or agent"
            searchLabel="Search users"
            status={params.status}
            statusOptions={[
              { value: "all", label: "Any" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "banned", label: "Banned" },
              { value: "locked", label: "Locked" },
            ]}
            onStatus={(value) => params.update({ status: value === "all" ? null : value, page: null })}
            range={params.created}
            rangePresets={createdPresets}
            onRange={(value) => params.update({ created: value === "all" ? null : value, page: null })}
          >
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
              ]}
              onChange={(value) => params.update({ balance: value === "all" ? null : value, page: null })}
            />
            <Combobox
              label="Activity"
              value={params.activity}
              options={[
                { value: "all", label: "Any" },
                { value: "online", label: "Online" },
                { value: "quiet", label: "No active session" },
              ]}
              onChange={(value) => params.update({ activity: value === "all" ? null : value, page: null })}
            />
            <Combobox
              label="Betting"
              value={params.betting}
              options={[
                { value: "all", label: "Any" },
                { value: "open", label: "Open bets" },
                { value: "settled", label: "Settled only" },
                { value: "none", label: "No bets" },
              ]}
              onChange={(value) => params.update({ betting: value === "all" ? null : value, page: null })}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={rows}
            caption="Platform users"
            toolbarLabel="Users"
            hiddenColumnIds={HIDDEN_COLUMNS}
            pageSizeOptions={[10, 20]}
            page={snapshot.page}
            pageSize={snapshot.pageSize}
            total={snapshot.total}
            sort={{ id: params.sort, desc: params.direction === "desc" }}
            onSortChange={(sort) => {
              if (!sort) return;
              params.update({
                sort: sort.id === "turnover" ? null : sort.id,
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
            emptyTitle="No users found"
            emptyDescription="Try changing your search or filters."
          />
        </>
      ) : null}

      {quickView ? (
        <UserQuickView key={quickView.id} user={quickView} onOpenChange={(open) => { if (!open) setQuickView(null); }} />
      ) : null}
      {statusTarget ? (
        <UserStatusDialog
          key={`${statusTarget.user.id}-${statusTarget.action}`}
          user={statusTarget.user}
          action={statusTarget.action}
          onOpenChange={(open) => {
            if (!open) setStatusTarget(null);
          }}
          onCompleted={refresh}
        />
      ) : null}
      {logoutTarget?.activeSessionId ? (
        <UserSessionDialog
          key={logoutTarget.activeSessionId}
          userId={logoutTarget.id}
          userName={logoutTarget.displayName}
          sessionId={logoutTarget.activeSessionId}
          onOpenChange={(open) => {
            if (!open) setLogoutTarget(null);
          }}
          onCompleted={refresh}
        />
      ) : null}
    </div>
  );
}
