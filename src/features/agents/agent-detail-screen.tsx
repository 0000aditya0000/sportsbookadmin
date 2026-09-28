"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { ActivityTimeline } from "@/components/display/activity-timeline";
import { CopyButton } from "@/components/display/copy-button";
import { MetricCard } from "@/components/display/metric-card";
import { MoneyDisplay } from "@/components/display/money-display";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, ForbiddenState, QueryFailure } from "@/components/states/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentFormDialog } from "@/features/agents/agent-form-dialog";
import { AgentStatusBadge } from "@/features/agents/agent-status-badge";
import { AgentStatusDialog } from "@/features/agents/agent-status-dialog";
import { AgentReferralPanel } from "@/features/referrals/agent-referral-panel";
import { getAgent } from "@/lib/api/agents";
import { formatCount, formatDateTime, formatShare, formatTime } from "@/lib/format";
import type { AgentDetail } from "@/lib/validation/agents";

const tabs = ["overview", "users", "bets", "wallet", "transactions", "performance", "reports", "activity", "referrals"] as const;
type AgentTab = (typeof tabs)[number];

export function AgentDetailScreen({ agentId }: { agentId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const canEdit = usePermission(PERMISSIONS.AGENT_EDIT);
  const canViewUsers = usePermission(PERMISSIONS.USER_VIEW);
  const canViewReports = usePermission(PERMISSIONS.REPORT_VIEW);
  const canViewReferrals = usePermission(PERMISSIONS.REFERRAL_VIEW);
  const [editing, setEditing] = useState(false);
  const [statusAction, setStatusAction] = useState<"suspend" | "activate" | null>(null);
  const requested = searchParams.get("tab");
  const tab: AgentTab = tabs.includes(requested as AgentTab) ? (requested as AgentTab) : "overview";

  const query = useQuery({
    queryKey: ["agent", agentId],
    queryFn: () => getAgent(agentId),
  });
  const detail = query.data?.data;

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["agent", agentId] });
    void queryClient.invalidateQueries({ queryKey: ["agents"] });
  }

  function selectTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") params.delete("tab");
    else params.set("tab", value);
    const next = params.toString();
    router.replace(next ? `/agents/${agentId}?${next}` : `/agents/${agentId}`, { scroll: false });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title={detail?.agent.name ?? "Agent"}
        description={detail ? `${detail.agent.contactName} · ${detail.agent.username}` : "Agent desk, balances, and activity."}
        meta={
          detail ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              <AgentStatusBadge status={detail.agent.status} />
              <span className="inline-flex items-center gap-1 font-mono">
                {detail.agent.id}
                <CopyButton value={detail.agent.id} label={`Copy ${detail.agent.id}`} />
              </span>
              <span>As of {formatDateTime(detail.generatedAt)}</span>
            </span>
          ) : null
        }
        actions={
          detail && canEdit ? (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit agent
              </Button>
              {detail.agent.status === "active" ? (
                <Button variant="destructive" onClick={() => setStatusAction("suspend")}>
                  Suspend
                </Button>
              ) : (
                <Button onClick={() => setStatusAction("activate")}>Activate</Button>
              )}
            </>
          ) : null
        }
      />

      {detail?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Mock desk record. Wallet figures are supplied by the backend fixture and cannot be edited here.</span>
        </div>
      ) : null}

      {query.isError ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="This agent could not be loaded." />
      ) : null}
      {!detail && query.isLoading ? <Skeleton className="h-64 w-full" /> : null}

      {detail ? (
        <>
          <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-4" aria-label="Agent figures">
            <MetricCard label="Balance" value={<MoneyDisplay money={detail.agent.balance} display="kpi" />} hint="Wallet balance" />
            <MetricCard label="Users" value={<span className="text-xl font-semibold tabular-nums">{formatCount(detail.agent.users)}</span>} hint={`${formatCount(detail.agent.activeUsers)} active`} />
            <MetricCard label="Turnover" value={<MoneyDisplay money={detail.agent.turnover} display="kpi" />} hint="Today" />
            <MetricCard label="GGR" value={<MoneyDisplay money={detail.agent.ggr} display="kpi" tone="signed" />} hint="Today, backend-reported" />
            <MetricCard label="Commission" value={<MoneyDisplay money={detail.agent.commission} display="kpi" />} hint={`${formatShare(detail.agent.shareBps)}% share`} />
            <MetricCard label="Exposure" value={<MoneyDisplay money={detail.agent.exposure} display="kpi" />} hint="Open liability" />
          </section>

          <Tabs value={tab} onValueChange={selectTab}>
            <TabsList className="flex h-auto flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="bets">Bets</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Overview detail={detail} />
            </TabsContent>
            <TabsContent value="users">
              {canViewUsers ? <UsersTab detail={detail} /> : <ForbiddenState />}
            </TabsContent>
            <TabsContent value="bets">
              <BetsTab detail={detail} />
            </TabsContent>
            <TabsContent value="wallet">
              <WalletTab detail={detail} />
            </TabsContent>
            <TabsContent value="transactions">
              <TransactionsTab detail={detail} />
            </TabsContent>
            <TabsContent value="performance">
              <PerformanceTab detail={detail} />
            </TabsContent>
            <TabsContent value="reports">
              {canViewReports ? <ReportsTab detail={detail} /> : <ForbiddenState />}
            </TabsContent>
            <TabsContent value="activity">
              {detail.activity.length === 0 ? (
                <EmptyState title="No activity" description="The backend has not recorded any events for this desk." />
              ) : (
                <section className="rounded-md border border-border bg-card p-4">
                  <ActivityTimeline items={detail.activity} />
                </section>
              )}
            </TabsContent>
            <TabsContent value="referrals">
              {canViewReferrals ? <AgentReferralPanel agentId={agentId} /> : <ForbiddenState />}
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      {editing && detail ? (
        <AgentFormDialog
          mode="edit"
          agent={detail.agent}
          onOpenChange={setEditing}
          onCompleted={refresh}
        />
      ) : null}
      {statusAction && detail ? (
        <AgentStatusDialog
          key={statusAction}
          agent={detail.agent}
          action={statusAction}
          onOpenChange={(open) => {
            if (!open) setStatusAction(null);
          }}
          onCompleted={refresh}
        />
      ) : null}
    </div>
  );
}

function Overview({ detail }: { detail: AgentDetail }) {
  const rows = [
    ["Contact", detail.agent.contactName],
    ["Username", detail.agent.username],
    ["Email", detail.agent.email],
    ["Phone", detail.agent.phone],
    ["Activity", detail.agent.activity === "trading" ? "Trading" : "Quiet"],
    ["Created", formatDateTime(detail.agent.createdAt)],
  ];
  return (
    <section className="rounded-md border border-border bg-card">
      <dl className="divide-y divide-border">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function UsersTab({ detail }: { detail: AgentDetail }) {
  if (detail.users.length === 0) {
    return <EmptyState title="No users" description="This desk has no accounts in the current feed." />;
  }
  return (
    <SimpleTable caption="Recent users">
      <thead>
        <tr>
          <th>User</th>
          <th>Status</th>
          <th>Balance</th>
          <th>Open bets</th>
          <th>Last login</th>
        </tr>
      </thead>
      <tbody>
        {detail.users.map((user) => (
          <tr key={user.id}>
            <td>
              <Link href={`/users/${user.id}`} className="font-medium hover:underline">
                {user.name}
              </Link>
              <p className="font-mono text-[11px] text-muted-foreground">{user.id}</p>
            </td>
            <td className="uppercase">{user.status}</td>
            <td><MoneyDisplay money={user.balance} /></td>
            <td className="tabular-nums">{formatCount(user.openBets)}</td>
            <td className="font-mono text-[12px] text-muted-foreground">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—"}</td>
          </tr>
        ))}
      </tbody>
    </SimpleTable>
  );
}

function BetsTab({ detail }: { detail: AgentDetail }) {
  if (detail.bets.length === 0) {
    return <EmptyState title="No bets" description="No bets were supplied for this desk in the current feed." />;
  }
  return (
    <SimpleTable caption="Recent bets">
      <thead>
        <tr>
          <th>Bet</th>
          <th>Event</th>
          <th>Market</th>
          <th>Stake</th>
          <th>Status</th>
          <th>Placed</th>
        </tr>
      </thead>
      <tbody>
        {detail.bets.map((bet) => (
          <tr key={bet.id}>
            <td>
              <Link href={`/bets/${bet.id}`} className="font-mono text-[12px] hover:underline">
                {bet.id}
              </Link>
            </td>
            <td>{bet.event}</td>
            <td>{bet.market}</td>
            <td><MoneyDisplay money={bet.stake} /></td>
            <td className="uppercase">{bet.status}</td>
            <td className="font-mono text-[12px] text-muted-foreground">{formatTime(bet.placedAt)}</td>
          </tr>
        ))}
      </tbody>
    </SimpleTable>
  );
}

function WalletTab({ detail }: { detail: AgentDetail }) {
  return (
    <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3" aria-label="Wallet">
      <MetricCard label="Balance" value={<MoneyDisplay money={detail.wallet.balance} display="kpi" />} hint="Ledger balance" />
      <MetricCard label="Held" value={<MoneyDisplay money={detail.wallet.held} display="kpi" />} hint="Amount held by the backend" />
      <MetricCard label="Commission" value={<MoneyDisplay money={detail.wallet.commission} display="kpi" />} hint="Commission posted for today" />
    </section>
  );
}

function TransactionsTab({ detail }: { detail: AgentDetail }) {
  if (detail.transactions.length === 0) {
    return <EmptyState title="No transactions" description="No wallet entries were supplied for this desk." />;
  }
  return (
    <SimpleTable caption="Recent wallet entries">
      <thead>
        <tr>
          <th>Transaction</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Reference</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {detail.transactions.map((entry) => (
          <tr key={entry.id}>
            <td className="font-mono text-[12px]">{entry.id}</td>
            <td>{entry.type}</td>
            <td>
              <MoneyDisplay money={entry.amount} />
              <p className="text-[11px] text-muted-foreground uppercase">{entry.direction}</p>
            </td>
            <td className="uppercase">{entry.status}</td>
            <td className="font-mono text-[12px]">{entry.reference}</td>
            <td className="font-mono text-[12px] text-muted-foreground">{formatDateTime(entry.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </SimpleTable>
  );
}

function PerformanceTab({ detail }: { detail: AgentDetail }) {
  if (detail.performance.length === 0) {
    return <EmptyState title="No series" description="The backend has not supplied a performance series for this desk." />;
  }
  return (
    <SimpleTable caption="Daily turnover and GGR">
      <thead>
        <tr>
          <th>Date</th>
          <th>Turnover</th>
          <th>GGR</th>
        </tr>
      </thead>
      <tbody>
        {detail.performance.map((point) => (
          <tr key={point.date}>
            <td className="font-mono text-[12px]">{point.date}</td>
            <td><MoneyDisplay money={point.turnover} /></td>
            <td><MoneyDisplay money={point.ggr} tone="signed" /></td>
          </tr>
        ))}
      </tbody>
    </SimpleTable>
  );
}

function ReportsTab({ detail }: { detail: AgentDetail }) {
  return (
    <SimpleTable caption="Desk reports">
      <thead>
        <tr>
          <th>Report</th>
          <th>Period</th>
          <th>Turnover</th>
          <th>GGR</th>
        </tr>
      </thead>
      <tbody>
        {detail.reports.map((report) => (
          <tr key={report.id}>
            <td>
              <Link href="/reports" className="hover:underline">
                {report.title}
              </Link>
            </td>
            <td>{report.period}</td>
            <td><MoneyDisplay money={report.turnover} /></td>
            <td><MoneyDisplay money={report.ggr} tone="signed" /></td>
          </tr>
        ))}
      </tbody>
    </SimpleTable>
  );
}

function SimpleTable({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <div className="ops-scroll overflow-x-auto rounded-md border border-border bg-card">
      <table className="w-full min-w-[640px] border-collapse text-left text-[13px] [&_td]:border-t [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:text-[11px] [&_th]:font-medium [&_th]:tracking-[0.12em] [&_th]:text-muted-foreground [&_th]:uppercase [&_thead]:bg-muted/70">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}
