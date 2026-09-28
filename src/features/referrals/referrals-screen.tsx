"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
import { ReferralUserDrawer } from "@/features/referrals/referral-user-drawer";
import {
  AcquisitionSourceBadge,
  ReferralUserStatusBadge,
} from "@/features/referrals/referral-status-badges";
import { useReferralParams } from "@/hooks/use-referral-params";
import { listReferralUsers } from "@/lib/api/referrals";
import { formatCount, formatDateTime } from "@/lib/format";
import type { ReferralUserListItem } from "@/lib/validation/referrals";

const helper = createDataColumns<ReferralUserListItem>();
const EMPTY_ROWS: ReferralUserListItem[] = [];

const registeredPresets = [
  { value: "all", label: "Any date", hint: "All registration dates" },
  { value: "7d", label: "7 days", hint: "Registered in the last 7 days" },
  { value: "30d", label: "30 days", hint: "Registered in the last 30 days" },
  { value: "90d", label: "90 days", hint: "Registered in the last 90 days" },
];

export function ReferralsScreen() {
  const params = useReferralParams();
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);

  const listQuery = {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    referrer: params.referrer,
    agent: params.agent,
    level: params.level,
    source: params.source,
    status: params.status,
    registered: params.registered,
    sort: params.sort,
    direction: params.direction,
  } as const;

  const query = useQuery({
    queryKey: ["referrals", listQuery],
    queryFn: () => listReferralUsers(listQuery),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("displayName", {
          id: "displayName",
          header: "User",
          cell: (info) => {
            const row = info.row.original;
            return (
              <button type="button" className="text-left hover:underline" onClick={() => setDrawerUserId(row.id)}>
                <span className="font-medium">{row.displayName}</span>
                <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{row.id}</span>
              </button>
            );
          },
        }),
        helper.accessor("referralCode", {
          id: "code",
          header: "Referral code",
          enableSorting: false,
          cell: (info) => <span className="font-mono text-[12px]">{info.getValue()}</span>,
        }),
        helper.accessor("directReferrerName", {
          id: "referrer",
          header: "Direct referrer",
          enableSorting: false,
          cell: (info) => {
            const row = info.row.original;
            if (!row.directReferrerId || !row.directReferrerName) {
              return <span className="text-muted-foreground">—</span>;
            }
            return canViewUser ? (
              <Link href={`/users/${row.directReferrerId}?tab=referrals`} className="hover:underline">
                {row.directReferrerName}
              </Link>
            ) : (
              <span>{row.directReferrerName}</span>
            );
          },
        }),
        helper.accessor("referralLevel", {
          id: "referralLevel",
          header: "Referral level",
          cell: (info) => {
            const level = info.getValue();
            return level ? `Level ${level}` : <span className="text-muted-foreground">Root</span>;
          },
        }),
        helper.accessor("agentOwnerName", {
          id: "agent",
          header: "Agent owner",
          enableSorting: false,
          cell: (info) => {
            const row = info.row.original;
            return canViewAgent ? (
              <Link href={`/agents/${row.agentOwnerId}?tab=referrals`} className="hover:underline">
                {row.agentOwnerName}
              </Link>
            ) : (
              <span>{row.agentOwnerName}</span>
            );
          },
        }),
        helper.accessor("acquisitionSource", {
          id: "source",
          header: "Acquisition source",
          enableSorting: false,
          cell: (info) => <AcquisitionSourceBadge source={info.getValue()} />,
        }),
        helper.accessor("registeredAt", {
          id: "registeredAt",
          header: "Registration",
          cell: (info) => (
            <span className="font-mono text-[12px] text-muted-foreground">{formatDateTime(info.getValue())}</span>
          ),
        }),
        helper.accessor("status", {
          id: "status",
          header: "Status",
          enableSorting: false,
          cell: (info) => <ReferralUserStatusBadge status={info.getValue()} />,
        }),
        helper.accessor("totalCommission", {
          id: "totalCommission",
          header: "Total commission",
          cell: (info) => <MoneyDisplay money={info.getValue()} />,
        }),
      ]),
    [canViewAgent, canViewUser],
  );

  const snapshot = query.data?.data;
  const rows = snapshot?.items ?? EMPTY_ROWS;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Referral Management"
        description="Monitor referral relationships, six-level network activity and referral commission."
        meta={
          snapshot ? (
            <span className="font-mono">
              Snapshot {formatDateTime(snapshot.generatedAt)} · {snapshot.source}
            </span>
          ) : null
        }
      />
      {query.isError && !snapshot ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="Referral data could not be loaded." />
      ) : null}
      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>
            Mock referral feed. Direct referrer and agent owner are separate fields. Summary figures are service fixtures.
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
            className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-5"
            aria-label="Referral summary"
          >
            <MetricCard
              label="Total referral users"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.totalReferralUsers)}</span>}
              hint="Service snapshot"
            />
            <MetricCard
              label="Total commission"
              value={<MoneyDisplay money={snapshot.summary.totalCommission} display="kpi" />}
              hint="Service snapshot"
            />
            <MetricCard
              label="Posted commission"
              value={<MoneyDisplay money={snapshot.summary.postedCommission} display="kpi" />}
              hint="Service snapshot"
            />
            <MetricCard
              label="Pending commission"
              value={<MoneyDisplay money={snapshot.summary.pendingCommission} display="kpi" />}
              hint="Service snapshot"
            />
            <MetricCard
              label="Level 1 users"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.level1Users)}</span>}
            />
          </section>

          <section className="overflow-hidden rounded-md border border-border bg-card" aria-label="Level breakdown">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">Level breakdown</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Six levels only. No Level 7.</p>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-4 py-2 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              <span>Level</span>
              <span>Users</span>
              <span>Commission</span>
            </div>
            {snapshot.summary.levels.map((row) => (
              <div
                key={row.level}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-t border-border px-4 py-2.5 text-sm"
              >
                <span>Level {row.level}</span>
                <span className="tabular-nums">{formatCount(row.users)}</span>
                <MoneyDisplay money={row.commission} />
              </div>
            ))}
          </section>

          <FilterBar
            search={params.q}
            onSearch={(value) => params.update({ q: value.trim() ? value : null, page: null })}
            searchPlaceholder="Search user, phone, referral code, or referrer"
            searchLabel="Search referral users"
            status={params.status}
            statusOptions={[
              { value: "all", label: "Any" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "banned", label: "Banned" },
              { value: "locked", label: "Locked" },
            ]}
            onStatus={(value) => params.update({ status: value === "all" ? null : value, page: null })}
            range={params.registered}
            rangePresets={registeredPresets}
            onRange={(value) => params.update({ registered: value === "all" ? null : value, page: null })}
          >
            <Combobox
              label="Level"
              value={params.level}
              options={[
                { value: "all", label: "All levels" },
                { value: "1", label: "Level 1" },
                { value: "2", label: "Level 2" },
                { value: "3", label: "Level 3" },
                { value: "4", label: "Level 4" },
                { value: "5", label: "Level 5" },
                { value: "6", label: "Level 6" },
              ]}
              onChange={(value) => params.update({ level: value === "all" ? null : value, page: null })}
            />
            <Combobox
              label="Source"
              value={params.source}
              options={[
                { value: "all", label: "Any" },
                { value: "AGENT", label: "Agent" },
                { value: "USER_REFERRAL", label: "User referral" },
              ]}
              onChange={(value) => params.update({ source: value === "all" ? null : value, page: null })}
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
            caption="Referral users"
            toolbarLabel="Referral users"
            pageSizeOptions={[10, 20]}
            page={snapshot.page}
            pageSize={snapshot.pageSize}
            total={snapshot.total}
            sort={{ id: params.sort, desc: params.direction === "desc" }}
            onSortChange={(sort) => {
              if (!sort) return;
              params.update({
                sort: sort.id === "registeredAt" ? null : sort.id,
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
            emptyTitle="No referral users found"
            emptyDescription="Try changing your search or filters."
          />
        </>
      ) : null}
      {drawerUserId ? (
        <ReferralUserDrawer userId={drawerUserId} onOpenChange={(open) => !open && setDrawerUserId(null)} />
      ) : null}
    </div>
  );
}
