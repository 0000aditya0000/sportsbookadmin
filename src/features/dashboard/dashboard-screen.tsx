"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { CashflowChart, TurnoverChart } from "@/components/charts/operations-charts";
import { ActivityTimeline } from "@/components/display/activity-timeline";
import { ChartCard } from "@/components/display/chart-card";
import { CopyButton } from "@/components/display/copy-button";
import { MetricCard, StatCard } from "@/components/display/metric-card";
import { MoneyDisplay } from "@/components/display/money-display";
import { PercentageDisplay } from "@/components/display/percentage-display";
import { ConnectionStatus } from "@/components/display/status-indicators";
import { FilterBar } from "@/components/forms/filter-bar";
import { PageHeader } from "@/components/layout/page-header";
import {
  ErrorState,
  ForbiddenState,
  NetworkErrorState,
  ProviderUnavailableState,
  UnauthorizedState,
} from "@/components/states/feedback-states";
import { createDataColumns, DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTableParams } from "@/hooks/use-table-params";
import { getDashboard } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/errors";
import { formatCount, formatDateTime, formatShare, formatTime } from "@/lib/format";
import type { LiveOperation } from "@/lib/validation/dashboard";

const helper = createDataColumns<LiveOperation>();
const EMPTY_ROWS: LiveOperation[] = [];

const statusTone = {
  open: "info",
  live: "live",
  pending: "warning",
  settled: "success",
  rejected: "danger",
} as const;

export function DashboardScreen() {
  const params = useTableParams();
  const query = useQuery({
    queryKey: ["dashboard", params.range, params.page, params.pageSize, params.q, params.status, params.sort, params.dir],
    queryFn: () =>
      getDashboard({
        range: params.range,
        page: params.page,
        pageSize: params.pageSize,
        q: params.q,
        status: params.status,
        sort: params.sort,
        dir: params.dir,
      }),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("placedAt", {
          id: "placedAt",
          header: "Time",
          enableHiding: false,
          cell: (info) => (
            <time className="font-mono text-[12px] text-muted-foreground" dateTime={info.getValue()}>
              {formatTime(info.getValue())}
            </time>
          ),
        }),
        helper.accessor("reference", {
          id: "reference",
          header: "Bet",
          enableSorting: false,
          cell: (info) => (
            <span className="inline-flex items-center gap-1 font-mono text-[12px]">
              <Link href={`/bets/${info.row.original.id}`} className="hover:underline">
                {info.getValue()}
              </Link>
              <CopyButton value={info.getValue()} />
            </span>
          ),
        }),
        helper.accessor("event", { id: "event", header: "Event" }),
        helper.accessor("market", { id: "market", header: "Market", enableSorting: false }),
        helper.accessor((row) => row.stake.amountMinor, {
          id: "stake",
          header: "Stake",
          enableHiding: false,
          cell: (info) => <MoneyDisplay money={info.row.original.stake} />,
        }),
        helper.accessor("status", {
          id: "status",
          header: "Status",
          enableHiding: false,
          enableSorting: false,
          cell: (info) => (
            <StatusBadge tone={statusTone[info.getValue()]} pulse={info.getValue() === "live"}>
              {info.getValue()}
            </StatusBadge>
          ),
        }),
      ]),
    [],
  );

  const snapshot = query.data?.snapshot;
  const failure = query.error;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Operations dashboard"
        description="What is happening on the book right now: health, turnover, exposure, and live activity."
        meta={snapshot ? <span>As of {formatDateTime(snapshot.generatedAt)}</span> : null}
        actions={
          <Button variant="outline" onClick={() => void query.refetch()} loading={query.isFetching}>
            Refresh
          </Button>
        }
      />

      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Mock data from the dummy provider. These figures are fixtures, not production totals.</span>
        </div>
      ) : null}

      {failure && !snapshot ? <DashboardFailure error={failure} onRetry={() => void query.refetch()} /> : null}

      {!snapshot && query.isLoading ? <DashboardSkeleton /> : null}

      {snapshot ? (
        <>
          <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-4" aria-label="System health">
            <HealthCell
              label="Provider"
              value={healthLabel(snapshot.health.provider.status)}
              tone={snapshot.health.provider.status === "connected" ? "success" : "live"}
              detail={snapshot.health.provider.name}
            />
            <HealthCell label="API" value={healthLabel(snapshot.health.api.status)} tone="success" detail={`${snapshot.health.api.latencyMs} ms`} />
            <HealthCell label="WebSocket" value={healthLabel(snapshot.health.websocket.status)} tone="success" detail="Backend feed" />
            <HealthCell label="Live data" value={healthLabel(snapshot.health.liveData.status)} tone="live" detail="Odds and bets" pulse={snapshot.health.liveData.status === "active"} />
          </section>

          <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2 xl:grid-cols-4" aria-label="Primary figures">
            <MetricCard label="Today's turnover" hint="Stakes recorded today" value={<MoneyDisplay money={snapshot.kpis.turnover} display="kpi" />} />
            <MetricCard label="Today's GGR" hint="Backend-reported gross gaming revenue" value={<MoneyDisplay money={snapshot.kpis.ggr} display="kpi" tone="signed" />} />
            <MetricCard label="Current exposure" hint="Open liability from the backend" value={<MoneyDisplay money={snapshot.kpis.exposure} display="kpi" />} />
            <MetricCard label="Wallet liability" hint="Balances owed to users" value={<MoneyDisplay money={snapshot.kpis.walletLiability} display="kpi" />} />
          </section>

          <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-4" aria-label="Accounts and bets">
            <StatCard label="Users" value={formatCount(snapshot.kpis.totalUsers)} detail={`${formatCount(snapshot.kpis.activeUsers)} active`} />
            <StatCard label="Agents" value={formatCount(snapshot.kpis.totalAgents)} detail="Active desks" />
            <StatCard label="Open bets" value={formatCount(snapshot.kpis.openBets)} detail="Accepted, not settled" />
            <StatCard label="Live bets" value={formatCount(snapshot.kpis.liveBets)} detail="Included in open bets" />
          </section>

          <section className="grid gap-3 rounded-md border border-border bg-card px-4 py-3 text-sm lg:grid-cols-2">
            <p className="text-muted-foreground">
              Deposits <MoneyDisplay money={snapshot.cashflow.deposits} />
              <span className="px-2 text-border">·</span>
              Withdrawals <MoneyDisplay money={snapshot.cashflow.withdrawals} />
              <span className="px-2 text-border">·</span>
              Pending <MoneyDisplay money={snapshot.cashflow.pendingWithdrawals} />
              <span className="px-2 text-border">·</span>
              Net <MoneyDisplay money={snapshot.cashflow.net} tone="signed" />
            </p>
            <p className="text-muted-foreground lg:text-right">
              Bets {formatCount(snapshot.betting.total)}
              <span className="px-2 text-border">·</span>
              Settled {formatCount(snapshot.betting.settled)}
              <span className="px-2 text-border">·</span>
              Pending {formatCount(snapshot.betting.pending)}
              <span className="px-2 text-border">·</span>
              Rejected {formatCount(snapshot.betting.rejected)}
            </p>
          </section>

          <FilterBar
            search={params.q}
            onSearch={(value) => params.update({ q: value, page: "1" })}
            status={params.status}
            onStatus={(value) => params.update({ status: value, page: "1" })}
            statusOptions={[
              { value: "all", label: "All" },
              { value: "live", label: "Live" },
              { value: "open", label: "Open" },
              { value: "pending", label: "Pending" },
              { value: "settled", label: "Settled" },
              { value: "rejected", label: "Rejected" },
            ]}
            range={params.range}
            onRange={(value) => params.update({ range: value, page: "1" })}
            rangePresets={[
              { value: "today", label: "Today", hint: "28 Sep 2026" },
              { value: "7d", label: "7 days", hint: "22–28 Sep 2026" },
              { value: "14d", label: "14 days", hint: "15–28 Sep 2026" },
            ]}
          />

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <ChartCard title="Turnover and GGR" description="Backend series for the selected range. The console does not recalculate GGR.">
                <TurnoverChart series={snapshot.series} />
              </ChartCard>
            </div>
            <ChartCard title="Deposits and withdrawals" description="Cash movement supplied by the ledger feed.">
              <CashflowChart series={snapshot.series} />
            </ChartCard>
          </div>

          <section aria-label="Agent performance">
            <h2 className="mb-2 text-sm font-semibold">Agent performance · today</h2>
            <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
              {snapshot.agents.map((agent) => (
                <article key={agent.id} className="bg-card px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/agents/${agent.id}`} className="text-sm font-medium hover:underline">{agent.name}</Link>
                    <span className="font-mono text-[11px] text-muted-foreground">{agent.id}</span>
                  </div>
                  <p className="mt-2"><MoneyDisplay money={agent.turnover} /></p>
                  <p className="mt-1 text-xs text-muted-foreground">GGR <MoneyDisplay money={agent.ggr} tone="signed" /> · {formatCount(agent.users)} users</p>
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <DataTable
                key={`${params.status}-${params.q}-${params.page}-${params.pageSize}`}
                columns={columns}
                data={snapshot.operations.rows ?? EMPTY_ROWS}
                caption="Recent betting operations"
                page={snapshot.operations.page}
                pageSize={snapshot.operations.pageSize}
                total={snapshot.operations.total}
                sort={{ id: params.sort, desc: params.dir === "desc" }}
                onSortChange={(sort) =>
                  params.update({
                    sort: sort?.id ?? "placedAt",
                    dir: sort?.desc ? "desc" : "asc",
                    page: "1",
                  })
                }
                onPageChange={(page) => params.update({ page: String(page) })}
                onPageSizeChange={(pageSize) => params.update({ pageSize: String(pageSize), page: "1" })}
                isLoading={query.isFetching}
                enableSelection
                emptyTitle="No operations"
                emptyDescription="Nothing matches the current search or status filter."
              />
            </div>
            <div className="grid gap-4 xl:col-span-2">
              <section className="rounded-md border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <h2 className="text-sm font-semibold">Risk alerts</h2>
                <ul className="mt-3 grid gap-3">
                  {snapshot.alerts.map((alert) => (
                    <li key={alert.id} className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <StatusBadge tone={alert.severity === "critical" ? "danger" : alert.severity === "warning" ? "warning" : "info"}>
                          {alert.severity}
                        </StatusBadge>
                      </div>
                      <p className="text-xs text-muted-foreground">{alert.detail}</p>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-md border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <h2 className="text-sm font-semibold">Sport turnover · today</h2>
                <ul className="mt-3 grid gap-3">
                  {snapshot.sports.map((sport) => (
                    <li key={sport.sport}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span>{sport.sport}</span>
                        <span className="text-muted-foreground"><PercentageDisplay value={formatShare(sport.shareBps)} /></span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-chart-1" style={{ width: `${sport.shareBps / 100}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground"><MoneyDisplay money={sport.turnover} /></p>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-md border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{snapshot.provider.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Replaceable adapter. The console does not call the provider directly.</p>
                  </div>
                  <ConnectionStatus label="" value="Connected" tone="success" />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><dt className="text-muted-foreground">Latency</dt><dd className="font-mono">{snapshot.provider.latencyMs} ms</dd></div>
                  <div><dt className="text-muted-foreground">Events</dt><dd className="font-mono">{formatCount(snapshot.provider.eventsSynchronized)}</dd></div>
                  <div><dt className="text-muted-foreground">Odds</dt><dd className="font-mono">{formatCount(snapshot.provider.oddsSynchronized)}</dd></div>
                  <div><dt className="text-muted-foreground">Last error</dt><dd>{snapshot.provider.lastError ?? "None"}</dd></div>
                </dl>
                <div className="mt-3 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  Sync {formatDateTime(snapshot.provider.lastSyncAt)}
                  <CopyButton value={snapshot.provider.lastSyncAt} label="Copy sync time" />
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <h3 className="mb-3 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Control timeline</h3>
                  <ActivityTimeline items={snapshot.timeline} />
                </div>
                <Link href="/system/providers" className="mt-4 inline-block text-xs font-medium text-foreground hover:underline">
                  Provider monitoring
                </Link>
              </section>
            </div>
          </div>
          {query.data?.requestId ? (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              Request <span className="font-mono">{query.data.requestId}</span>
              <CopyButton value={query.data.requestId} label="Copy request ID" />
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function healthLabel(status: string) {
  if (status === "connected") return "Connected";
  if (status === "healthy") return "Healthy";
  if (status === "active") return "Active";
  return status;
}

function HealthCell({
  label,
  value,
  detail,
  tone,
  pulse = false,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "success" | "live";
  pulse?: boolean;
}) {
  return (
    <div className="bg-card px-4 py-3">
      <ConnectionStatus label={label} value={value} tone={tone === "live" ? "live" : "success"} pulse={pulse} />
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function DashboardFailure({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  if (error instanceof ApiError && error.code === "NETWORK") return <NetworkErrorState onRetry={onRetry} />;
  if (error instanceof ApiError && error.code === "FORBIDDEN") return <ForbiddenState />;
  if (error instanceof ApiError && error.code === "UNAUTHORIZED") return <UnauthorizedState />;
  if (error instanceof ApiError && error.code === "PROVIDER_UNAVAILABLE") return <ProviderUnavailableState />;
  if (error instanceof ApiError) {
    return <ErrorState message={error.message} requestId={error.requestId} onRetry={onRetry} />;
  }
  return <ErrorState message="The dashboard could not be loaded." onRetry={onRetry} />;
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
