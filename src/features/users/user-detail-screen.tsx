"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { ActivityTimeline } from "@/components/display/activity-timeline";
import { CopyButton } from "@/components/display/copy-button";
import { MetricCard } from "@/components/display/metric-card";
import { MoneyDisplay } from "@/components/display/money-display";
import { OddsDisplay } from "@/components/display/odds-display";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, QueryFailure } from "@/components/states/feedback-states";
import { createDataColumns, DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/avatar";
import { SessionStatusBadge, UserStatusBadge } from "@/features/users/user-status-badge";
import { UserSessionDialog } from "@/features/users/user-session-dialog";
import { UserStatusDialog } from "@/features/users/user-status-dialog";
import { UserReferralPanel } from "@/features/referrals/user-referral-panel";
import { getUser } from "@/lib/api/users";
import { formatCount, formatDateTime } from "@/lib/format";
import type { UserBet, UserDetail, UserSessionView, UserStatusChange } from "@/lib/validation/users";

const tabs = ["overview", "profile", "wallet", "bets", "transactions", "sessions", "activity", "risk", "referrals"] as const;
type UserTab = (typeof tabs)[number];

const betHelper = createDataColumns<UserBet>();
const betColumns = betHelper.columns([
  betHelper.accessor("id", {
    header: "Bet ID",
    enableSorting: false,
    cell: (info) => <span className="font-mono text-[12px]">{info.getValue()}</span>,
  }),
  betHelper.accessor("event", { header: "Event", enableSorting: false }),
  betHelper.accessor("market", { header: "Market", enableSorting: false }),
  betHelper.accessor("selection", { header: "Selection", enableSorting: false }),
  betHelper.accessor("stake", {
    header: "Stake",
    enableSorting: false,
    cell: (info) => <MoneyDisplay money={info.getValue()} />,
  }),
  betHelper.accessor("odds", {
    header: "Odds",
    enableSorting: false,
    cell: (info) => <OddsDisplay odds={info.getValue()} />,
  }),
  betHelper.accessor("potentialPayout", {
    header: "Potential payout",
    enableSorting: false,
    cell: (info) => <MoneyDisplay money={info.getValue()} />,
  }),
  betHelper.accessor("status", {
    header: "Status",
    enableSorting: false,
    cell: (info) => {
      const status = info.getValue();
      const tone = status === "open" ? "info" : status === "settled" ? "success" : status === "rejected" ? "danger" : "neutral";
      return <StatusBadge tone={tone}>{status}</StatusBadge>;
    },
  }),
  betHelper.accessor("placedAt", {
    header: "Placed",
    enableSorting: false,
    cell: (info) => <span className="font-mono text-[12px] text-muted-foreground">{formatDateTime(info.getValue())}</span>,
  }),
  betHelper.accessor("settlement", {
    header: "Settlement",
    enableSorting: false,
    cell: (info) => <span className="uppercase">{info.getValue()}</span>,
  }),
]);

const transactionHelper = createDataColumns<UserDetail["transactions"][number]>();
const transactionColumns = transactionHelper.columns([
  transactionHelper.accessor("id", {
    header: "Transaction ID",
    enableSorting: false,
    cell: (info) => (
      <span className="inline-flex items-center gap-1 font-mono text-[12px]">
        {info.getValue()}
        <CopyButton value={info.getValue()} label={`Copy ${info.getValue()}`} />
      </span>
    ),
  }),
  transactionHelper.accessor("type", { header: "Type", enableSorting: false }),
  transactionHelper.accessor("amount", {
    header: "Amount",
    enableSorting: false,
    cell: (info) => <MoneyDisplay money={info.getValue()} />,
  }),
  transactionHelper.accessor("direction", {
    header: "Direction",
    enableSorting: false,
    cell: (info) => <span className="uppercase">{info.getValue()}</span>,
  }),
  transactionHelper.accessor("status", { header: "Status", enableSorting: false }),
  transactionHelper.accessor("reference", {
    header: "Reference",
    enableSorting: false,
    cell: (info) => (
      <span className="inline-flex items-center gap-1 font-mono text-[12px]">
        {info.getValue()}
        <CopyButton value={info.getValue()} label={`Copy ${info.getValue()}`} />
      </span>
    ),
  }),
  transactionHelper.accessor("createdAt", {
    header: "Created",
    enableSorting: false,
    cell: (info) => <span className="font-mono text-[12px] text-muted-foreground">{formatDateTime(info.getValue())}</span>,
  }),
]);

export function UserDetailScreen({ userId }: { userId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);
  const canSuspend = usePermission(PERMISSIONS.USER_SUSPEND);
  const canBan = usePermission(PERMISSIONS.USER_BAN);
  const canRevoke = usePermission(PERMISSIONS.USER_SESSION_REVOKE);
  const [statusAction, setStatusAction] = useState<UserStatusChange["action"] | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [sessionTarget, setSessionTarget] = useState<UserSessionView | null>(null);
  const [sessionDetail, setSessionDetail] = useState<UserSessionView | null>(null);
  const requested = searchParams.get("tab");
  const tab: UserTab = tabs.includes(requested as UserTab) ? (requested as UserTab) : "overview";

  const query = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
  });
  const detail = query.data?.data;

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["user", userId] });
    void queryClient.invalidateQueries({ queryKey: ["users"] });
  }

  function selectTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") params.delete("tab");
    else params.set("tab", value);
    const next = params.toString();
    router.replace(next ? `/users/${userId}?${next}` : `/users/${userId}`, { scroll: false });
  }

  const user = detail?.user;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title={user?.displayName ?? "User"}
        description={user ? user.username : "Account status, wallet, bets, and sessions."}
        meta={
          user ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              <UserAvatar label={user.displayName} />
              <UserStatusBadge status={user.status} />
              <span className="inline-flex items-center gap-1 font-mono">
                {user.id}
                <CopyButton value={user.id} label={`Copy ${user.id}`} />
              </span>
              {canViewAgent ? (
                <Link href={`/agents/${user.agentId}`} className="hover:underline">
                  {user.agentName} · {user.agentId}
                </Link>
              ) : (
                <span>
                  {user.agentName} · {user.agentId}
                </span>
              )}
            </span>
          ) : null
        }
        actions={
          user ? (
            <>
              {canSuspend && user.status === "active" ? (
                <Button variant="outline" onClick={() => setStatusAction("suspend")}>
                  Suspend
                </Button>
              ) : null}
              {canSuspend && user.status === "suspended" ? (
                <Button onClick={() => setStatusAction("activate")}>Activate</Button>
              ) : null}
              {canSuspend && user.status === "locked" ? (
                <Button variant="outline" onClick={() => setStatusAction("unlock")}>
                  Unlock
                </Button>
              ) : null}
              {canBan && (user.status === "active" || user.status === "suspended") ? (
                <Button variant="destructive" onClick={() => setStatusAction("ban")}>
                  Ban
                </Button>
              ) : null}
              {canRevoke && user.activeSessionId ? (
                <Button variant="outline" onClick={() => setLogoutOpen(true)}>
                  Logout user
                </Button>
              ) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" aria-label="More user actions">
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {tabs
                    .filter((item) => item !== "overview")
                    .map((item) => (
                      <DropdownMenuItem key={item} onSelect={() => selectTab(item)}>
                        {item[0]!.toUpperCase() + item.slice(1)}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : null
        }
      />

      {detail?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Mock user record. Wallet, bets, and risk figures are fixtures supplied by the service.</span>
        </div>
      ) : null}

      {query.isError && !detail ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="This user could not be loaded." />
      ) : null}

      {!detail && query.isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : null}

      {detail && user ? (
        <>
          <section
            className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-5"
            aria-label="User position"
          >
            <MetricCard label="Balance" value={<MoneyDisplay money={user.balance} display="kpi" />} hint="Available" />
            <MetricCard
              label="Open bets"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(user.openBets)}</span>}
              hint={`${formatCount(user.totalBets)} total bets`}
            />
            <MetricCard label="Turnover" value={<MoneyDisplay money={user.turnover} display="kpi" />} hint="Reported by the service" />
            <MetricCard label="GGR" value={<MoneyDisplay money={user.ggr} display="kpi" tone="signed" />} hint="Reported by the service" />
            <MetricCard
              label="Last login"
              value={
                <span className="text-sm font-semibold">
                  {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "No login"}
                </span>
              }
              hint={`Registered ${formatDateTime(user.createdAt)}`}
            />
          </section>

          <Tabs value={tab} onValueChange={selectTab}>
            <TabsList className="h-auto w-full max-w-full flex-wrap justify-start">
              {tabs.map((item) => (
                <TabsTrigger key={item} value={item}>
                  {item[0]!.toUpperCase() + item.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview">
              <Overview detail={detail} canViewAgent={canViewAgent} />
            </TabsContent>
            <TabsContent value="profile">
              <Profile detail={detail} canViewAgent={canViewAgent} />
            </TabsContent>
            <TabsContent value="wallet">
              <WalletTab detail={detail} />
            </TabsContent>
            <TabsContent value="bets">
              <BetsTab detail={detail} />
            </TabsContent>
            <TabsContent value="transactions">
              <TransactionsTab detail={detail} />
            </TabsContent>
            <TabsContent value="sessions">
              <SessionsTab
                detail={detail}
                canRevoke={canRevoke}
                onRevoke={setSessionTarget}
                onView={setSessionDetail}
              />
            </TabsContent>
            <TabsContent value="activity">
              <ActivityTab detail={detail} />
            </TabsContent>
            <TabsContent value="risk">
              <RiskTab detail={detail} />
            </TabsContent>
            <TabsContent value="referrals">
              <UserReferralPanel userId={userId} />
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      {statusAction && user ? (
        <UserStatusDialog
          key={statusAction}
          user={user}
          action={statusAction}
          onOpenChange={(open) => {
            if (!open) setStatusAction(null);
          }}
          onCompleted={refresh}
        />
      ) : null}
      {logoutOpen && user?.activeSessionId ? (
        <UserSessionDialog
          userId={user.id}
          userName={user.displayName}
          sessionId={user.activeSessionId}
          onOpenChange={setLogoutOpen}
          onCompleted={refresh}
        />
      ) : null}
      {sessionTarget ? (
        <UserSessionDialog
          key={sessionTarget.id}
          userId={userId}
          userName={user?.displayName ?? userId}
          sessionId={sessionTarget.id}
          device={`${sessionTarget.device} · ${sessionTarget.browser}`}
          onOpenChange={(open) => {
            if (!open) setSessionTarget(null);
          }}
          onCompleted={refresh}
        />
      ) : null}
      {sessionDetail ? (
        <Dialog open onOpenChange={(open) => { if (!open) setSessionDetail(null); }}>
          <DialogContent>
            <DialogTitle>Session {sessionDetail.id}</DialogTitle>
            <DialogDescription>Server session recorded for this account.</DialogDescription>
            <dl className="mt-4 divide-y divide-border rounded-md border border-border">
              {(
                [
                  ["Device", sessionDetail.device],
                  ["Browser", sessionDetail.browser],
                  ["OS", sessionDetail.os],
                  ["IP", sessionDetail.ip],
                  ["Login", formatDateTime(sessionDetail.loginAt)],
                  ["Last activity", formatDateTime(sessionDetail.lastActiveAt)],
                  ["Expiry", formatDateTime(sessionDetail.expiresAt)],
                  ["Status", sessionDetail.status],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-3 py-2 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

function FactList({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <section className="rounded-md border border-border bg-card">
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Overview({ detail, canViewAgent }: { detail: UserDetail; canViewAgent: boolean }) {
  const user = detail.user;
  return (
    <div className="grid gap-4">
      <FactList
        rows={[
          { label: "Status", value: <UserStatusBadge status={user.status} /> },
          {
            label: "Agent",
            value: canViewAgent ? (
              <Link href={`/agents/${user.agentId}`} className="hover:underline">
                {user.agentName} · {user.agentId}
              </Link>
            ) : (
              `${user.agentName} · ${user.agentId}`
            ),
          },
          { label: "Balance", value: <MoneyDisplay money={user.balance} /> },
          { label: "Open bets", value: formatCount(user.openBets) },
          { label: "Total bets", value: formatCount(user.totalBets) },
          { label: "Turnover", value: <MoneyDisplay money={user.turnover} /> },
          { label: "GGR", value: <MoneyDisplay money={user.ggr} tone="signed" /> },
          { label: "Registered", value: formatDateTime(user.createdAt) },
          { label: "Last login", value: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—" },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Recent bets</h2>
          {detail.bets.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">This user has no betting activity.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {detail.bets.slice(0, 3).map((bet) => (
                <li key={bet.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    <span className="font-medium">{bet.event}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{bet.id}</span>
                  </span>
                  <MoneyDisplay money={bet.stake} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-md border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Recent transactions</h2>
          {detail.transactions.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No wallet transactions are available.</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {detail.transactions.slice(0, 3).map((transaction) => (
                <li key={transaction.id} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    <span className="font-medium">{transaction.type}</span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground uppercase">{transaction.direction}</span>
                  </span>
                  <MoneyDisplay money={transaction.amount} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section className="rounded-md border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
        <ActivityTimeline items={detail.activity.slice(0, 4)} />
      </section>
    </div>
  );
}

function Profile({ detail, canViewAgent }: { detail: UserDetail; canViewAgent: boolean }) {
  const user = detail.user;
  return (
    <FactList
      rows={[
        { label: "Name", value: user.displayName },
        { label: "Username", value: user.username },
        { label: "Phone", value: user.phone },
        { label: "Email", value: user.email },
        {
          label: "Agent",
          value: canViewAgent ? (
            <Link href={`/agents/${user.agentId}`} className="hover:underline">
              {user.agentName} · {user.agentId}
            </Link>
          ) : (
            `${user.agentName} · ${user.agentId}`
          ),
        },
        { label: "Registered", value: formatDateTime(user.createdAt) },
        { label: "Account status", value: <UserStatusBadge status={user.status} /> },
      ]}
    />
  );
}

function WalletTab({ detail }: { detail: UserDetail }) {
  return (
    <div className="grid gap-4">
      <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
        <MetricCard label="Available balance" value={<MoneyDisplay money={detail.wallet.available} display="kpi" />} hint="Service balance" />
        <MetricCard label="Held balance" value={<MoneyDisplay money={detail.wallet.held} display="kpi" />} hint="Held by the service" />
      </section>
      <p className="text-xs text-muted-foreground">Balances are reported by the service. This screen does not post ledger entries.</p>
      <TransactionsTab detail={detail} />
    </div>
  );
}

function BetsTab({ detail }: { detail: UserDetail }) {
  const [section, setSection] = useState("all");
  const rows = useMemo(
    () => (section === "all" ? detail.bets : detail.bets.filter((bet) => bet.status === section)),
    [detail.bets, section],
  );
  return (
    <div className="grid gap-3">
      <Select aria-label="Bet section" value={section} className="h-9 w-44" onChange={(event) => setSection(event.target.value)}>
        <option value="all">All</option>
        <option value="open">Open</option>
        <option value="settled">Settled</option>
        <option value="rejected">Rejected</option>
        <option value="cancelled">Cancelled</option>
      </Select>
      {rows.length === 0 ? (
        <EmptyState title="No bets" description="This user has no betting activity." />
      ) : (
        <DataTable
          columns={betColumns}
          data={rows}
          caption="User bets"
          toolbarLabel="Bets"
          page={1}
          pageSize={Math.max(rows.length, 1)}
          total={rows.length}
          onPageChange={() => undefined}
          emptyTitle="No bets"
          emptyDescription="This user has no betting activity."
        />
      )}
    </div>
  );
}

function TransactionsTab({ detail }: { detail: UserDetail }) {
  if (detail.transactions.length === 0) {
    return <EmptyState title="No transactions" description="No wallet transactions are available." />;
  }
  return (
    <DataTable
      columns={transactionColumns}
      data={detail.transactions}
      caption="User transactions"
      toolbarLabel="Transactions"
      page={1}
      pageSize={Math.max(detail.transactions.length, 1)}
      total={detail.transactions.length}
      onPageChange={() => undefined}
      emptyTitle="No transactions"
      emptyDescription="No wallet transactions are available."
    />
  );
}

function SessionsTab({
  detail,
  canRevoke,
  onRevoke,
  onView,
}: {
  detail: UserDetail;
  canRevoke: boolean;
  onRevoke: (session: UserSessionView) => void;
  onView: (session: UserSessionView) => void;
}) {
  if (detail.sessions.length === 0) {
    return <EmptyState title="No sessions" description="This user currently has no active or recent sessions." />;
  }

  const activeCount = detail.sessions.filter((session) => session.status === "active").length;

  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-foreground">
        {activeCount === 0
          ? "No active server session."
          : "One active server session. Older rows are revoked or expired."}
      </p>
      <div className="ops-scroll overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <caption className="sr-only">User sessions</caption>
          <thead>
            <tr className="border-b border-border text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              <th className="px-3 py-2 font-medium">Device</th>
              <th className="px-3 py-2 font-medium">Browser</th>
              <th className="px-3 py-2 font-medium">OS</th>
              <th className="px-3 py-2 font-medium">IP</th>
              <th className="px-3 py-2 font-medium">Login</th>
              <th className="px-3 py-2 font-medium">Last activity</th>
              <th className="px-3 py-2 font-medium">Expiry</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {detail.sessions.map((session) => (
              <tr key={session.id} className="border-t border-border">
                <td className="px-3 py-2">{session.device}</td>
                <td className="px-3 py-2">{session.browser}</td>
                <td className="px-3 py-2">{session.os}</td>
                <td className="px-3 py-2 font-mono text-[12px]">{session.ip}</td>
                <td className="px-3 py-2 font-mono text-[12px] text-muted-foreground">{formatDateTime(session.loginAt)}</td>
                <td className="px-3 py-2 font-mono text-[12px] text-muted-foreground">{formatDateTime(session.lastActiveAt)}</td>
                <td className="px-3 py-2 font-mono text-[12px] text-muted-foreground">{formatDateTime(session.expiresAt)}</td>
                <td className="px-3 py-2">
                  <SessionStatusBadge status={session.status} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView(session)}>
                      View
                    </Button>
                    {canRevoke && session.status === "active" ? (
                      <Button variant="outline" size="sm" onClick={() => onRevoke(session)}>
                        Revoke
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityTab({ detail }: { detail: UserDetail }) {
  if (detail.activity.length === 0) {
    return <EmptyState title="No activity" description="The service has not recorded any events for this user." />;
  }
  return (
    <section className="rounded-md border border-border bg-card p-4">
      <ActivityTimeline items={detail.activity} />
    </section>
  );
}

function RiskTab({ detail }: { detail: UserDetail }) {
  if (!detail.risk.available || !detail.risk.exposure || !detail.risk.maxStake || detail.risk.openBets === null) {
    return <EmptyState title="No risk figures" description={detail.risk.message} />;
  }
  return (
    <div className="grid gap-4">
      <p className="text-xs text-muted-foreground">{detail.risk.message}</p>
      <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Current exposure" value={<MoneyDisplay money={detail.risk.exposure} display="kpi" />} hint="Stored fixture" />
        <MetricCard
          label="Open bets"
          value={<span className="text-xl font-semibold tabular-nums">{formatCount(detail.risk.openBets)}</span>}
          hint="Stored fixture"
        />
        <MetricCard label="Stake limit" value={<MoneyDisplay money={detail.risk.maxStake} display="kpi" />} hint="Stored fixture" />
      </section>
      <FactList
        rows={[
          { label: "Flags", value: detail.risk.flags.length > 0 ? detail.risk.flags.join(", ") : "None" },
          {
            label: "Large bets",
            value: detail.risk.largeBetIds.length > 0 ? detail.risk.largeBetIds.join(", ") : "None",
          },
        ]}
      />
    </div>
  );
}
