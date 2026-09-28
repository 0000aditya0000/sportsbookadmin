"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/avatar";
import { AgentFormDialog } from "@/features/agents/agent-form-dialog";
import { AgentRowMenu } from "@/features/agents/agent-row-menu";
import { AgentStatusBadge } from "@/features/agents/agent-status-badge";
import { AgentStatusDialog } from "@/features/agents/agent-status-dialog";
import { useAgentParams } from "@/hooks/use-agent-params";
import { listAgents } from "@/lib/api/agents";
import { formatCount, formatDateTime, formatShare } from "@/lib/format";
import type { AgentListItem } from "@/lib/validation/agents";

const helper = createDataColumns<AgentListItem>();
const EMPTY_ROWS: AgentListItem[] = [];
const HIDDEN_COLUMNS = ["id", "activeUsers", "exposure"];

const createdPresets = [
  { value: "all", label: "Any date", hint: "All created dates" },
  { value: "7d", label: "7 days", hint: "Created in the last 7 days" },
  { value: "30d", label: "30 days", hint: "Created in the last 30 days" },
  { value: "90d", label: "90 days", hint: "Created in the last 90 days" },
];

export function AgentsScreen() {
  const params = useAgentParams();
  const queryClient = useQueryClient();
  const canCreate = usePermission(PERMISSIONS.AGENT_CREATE);
  const [form, setForm] = useState<"create" | AgentListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    agent: AgentListItem;
    action: "suspend" | "activate";
  } | null>(null);

  const listQuery = {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    status: params.status,
    created: params.created,
    balance: params.balance,
    performance: params.performance,
    activity: params.activity,
    sort: params.sort,
    direction: params.direction,
  } as const;
  const query = useQuery({
    queryKey: ["agents", listQuery],
    queryFn: () => listAgents(listQuery),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("id", {
          id: "id",
          header: "Agent ID",
          enableSorting: false,
          cell: (info) => <span className="font-mono text-[12px]">{info.getValue()}</span>,
        }),
        helper.accessor("name", {
          id: "name",
          header: "Agent",
          enableHiding: false,
          cell: (info) => {
            const agent = info.row.original;
            return (
              <div className="flex items-center gap-2.5">
                <UserAvatar label={agent.name} />
                <div className="min-w-0">
                  <Link href={`/agents/${agent.id}`} className="font-medium hover:underline">
                    {agent.name}
                  </Link>
                  <p className="truncate text-[11px] text-muted-foreground">{agent.contactName}</p>
                  <p className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                    {agent.id}
                    <span aria-hidden>·</span>
                    {agent.username}
                    <CopyButton value={agent.id} label={`Copy ${agent.id}`} />
                  </p>
                </div>
              </div>
            );
          },
        }),
        helper.accessor("status", {
          id: "status",
          header: "Status",
          enableSorting: false,
          enableHiding: false,
          cell: (info) => <AgentStatusBadge status={info.getValue()} />,
        }),
        helper.accessor("users", {
          id: "users",
          header: "Users",
          cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
        }),
        helper.accessor("activeUsers", {
          id: "activeUsers",
          header: "Active users",
          enableSorting: false,
          cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
        }),
        helper.accessor((row) => row.balance.amountMinor, {
          id: "balance",
          header: "Balance",
          cell: (info) => <MoneyDisplay money={info.row.original.balance} />,
        }),
        helper.accessor((row) => row.turnover.amountMinor, {
          id: "turnover",
          header: "Turnover",
          cell: (info) => <MoneyDisplay money={info.row.original.turnover} />,
        }),
        helper.accessor((row) => row.ggr.amountMinor, {
          id: "ggr",
          header: "GGR",
          cell: (info) => <MoneyDisplay money={info.row.original.ggr} tone="signed" />,
        }),
        helper.accessor((row) => row.commission.amountMinor, {
          id: "commission",
          header: "Commission",
          cell: (info) => (
            <div>
              <MoneyDisplay money={info.row.original.commission} />
              <p className="text-[11px] text-muted-foreground">
                <PercentageDisplay value={formatShare(info.row.original.shareBps)} /> share
              </p>
            </div>
          ),
        }),
        helper.accessor((row) => row.exposure.amountMinor, {
          id: "exposure",
          header: "Exposure",
          enableSorting: false,
          cell: (info) => <MoneyDisplay money={info.row.original.exposure} />,
        }),
        helper.accessor("createdAt", {
          id: "createdAt",
          header: "Created",
          cell: (info) => (
            <time className="font-mono text-[12px] text-muted-foreground" dateTime={info.getValue()}>
              {formatDateTime(info.getValue())}
            </time>
          ),
        }),
        helper.display({
          id: "actions",
          header: "Actions",
          enableSorting: false,
          enableHiding: false,
          cell: (info) => (
            <AgentRowMenu
              agent={info.row.original}
              onEdit={setForm}
              onStatus={(agent, action) => setStatusTarget({ agent, action })}
            />
          ),
        }),
      ]),
    [],
  );

  const snapshot = query.data?.data;
  const rows = snapshot?.items ?? EMPTY_ROWS;

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["agents"] });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Agents"
        description="Manage platform agents, performance, balances and operational activity."
        meta={snapshot ? <span>As of {formatDateTime(snapshot.generatedAt)}</span> : null}
        actions={
          canCreate ? (
            <Button onClick={() => setForm("create")}>Create agent</Button>
          ) : null
        }
      />

      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Mock agent book. Figures are fixtures from the dummy provider, not production totals.</span>
        </div>
      ) : null}

      {query.isError && !snapshot ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="Agents could not be loaded." />
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
            aria-label="Agent book"
          >
            <MetricCard label="Total agents" value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.totalAgents)}</span>} hint="Desks on the book" />
            <MetricCard label="Active agents" value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.activeAgents)}</span>} hint="Able to accept bets" />
            <MetricCard label="Suspended agents" value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.suspendedAgents)}</span>} hint="Blocked pending review" />
            <MetricCard label="Total agent balance" value={<MoneyDisplay money={snapshot.summary.balance} display="kpi" />} hint="Sum reported by the backend" />
            <MetricCard label="Today's agent turnover" value={<MoneyDisplay money={snapshot.summary.turnover} display="kpi" />} hint="Stakes recorded today" />
            <MetricCard label="Today's agent GGR" value={<MoneyDisplay money={snapshot.summary.ggr} display="kpi" tone="signed" />} hint="Backend-reported gross gaming revenue" />
          </section>

          <FilterBar
            search={params.q}
            onSearch={(value) => params.update({ q: value, page: null })}
            searchPlaceholder="Search name, ID, username, email, or phone"
            searchLabel="Search agents"
            status={params.status}
            statusOptions={[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "pending", label: "Pending" },
              { value: "inactive", label: "Inactive" },
            ]}
            onStatus={(value) => params.update({ status: value === "all" ? null : value, page: null })}
            range={params.created}
            rangePresets={createdPresets}
            onRange={(value) => params.update({ created: value === "all" ? null : value, page: null })}
          >
            <Combobox
              label="Balance"
              value={params.balance}
              options={[
                { value: "all", label: "Any" },
                { value: "under_1l", label: "Under ₹1L" },
                { value: "1l_10l", label: "₹1L–₹10L" },
                { value: "over_10l", label: "Over ₹10L" },
              ]}
              onChange={(value) => params.update({ balance: value === "all" ? null : value, page: null })}
            />
            <Combobox
              label="Performance"
              value={params.performance}
              options={[
                { value: "all", label: "Any" },
                { value: "positive_ggr", label: "Positive GGR" },
                { value: "flat_ggr", label: "Flat GGR" },
                { value: "high_turnover", label: "Turnover ≥ ₹5L" },
              ]}
              onChange={(value) => params.update({ performance: value === "all" ? null : value, page: null })}
            />
            <Combobox
              label="Activity"
              value={params.activity}
              options={[
                { value: "all", label: "Any" },
                { value: "trading", label: "Trading" },
                { value: "quiet", label: "Quiet" },
              ]}
              onChange={(value) => params.update({ activity: value === "all" ? null : value, page: null })}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={rows}
            caption="Platform agents"
            toolbarLabel="Agents"
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
            emptyTitle="No agents"
            emptyDescription="No desks match this search or filter."
          />
        </>
      ) : null}

      {form ? (
        <AgentFormDialog
          key={form === "create" ? "create" : form.id}
          mode={form === "create" ? "create" : "edit"}
          agent={form === "create" ? undefined : form}
          onOpenChange={(open) => {
            if (!open) setForm(null);
          }}
          onCompleted={refresh}
        />
      ) : null}
      {statusTarget ? (
        <AgentStatusDialog
          key={`${statusTarget.agent.id}-${statusTarget.action}`}
          agent={statusTarget.agent}
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
