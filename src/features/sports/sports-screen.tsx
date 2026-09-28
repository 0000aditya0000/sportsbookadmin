"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { MetricCard } from "@/components/display/metric-card";
import { FilterBar } from "@/components/forms/filter-bar";
import { PageHeader } from "@/components/layout/page-header";
import { QueryFailure } from "@/components/states/feedback-states";
import { createDataColumns, DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { SportMark } from "@/features/sports/sport-mark";
import { SportRowMenu } from "@/features/sports/sport-row-menu";
import { SportStatusBadge } from "@/features/sports/sport-status-badge";
import { useSportParams } from "@/hooks/use-sport-params";
import { listSports } from "@/lib/api/sports";
import { formatCount, formatDateTime } from "@/lib/format";
import type { SportListItem } from "@/lib/validation/sports";

const helper = createDataColumns<SportListItem>();
const EMPTY_ROWS: SportListItem[] = [];
const HIDDEN_COLUMNS = ["id", "totalEvents"];

const updatedPresets = [
  { value: "all", label: "Any date", hint: "All update times" },
  { value: "7d", label: "7 days", hint: "Updated in the last 7 days" },
  { value: "30d", label: "30 days", hint: "Updated in the last 30 days" },
  { value: "90d", label: "90 days", hint: "Updated in the last 90 days" },
];

export function SportsScreen() {
  const params = useSportParams();
  const listQuery = {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    status: params.status,
    provider: params.provider,
    activity: params.activity,
    updated: params.updated,
    sort: params.sort,
    direction: params.direction,
  } as const;

  const query = useQuery({
    queryKey: ["sports", listQuery],
    queryFn: () => listSports(listQuery),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("id", {
          id: "id",
          header: "Sport ID",
          enableSorting: false,
          cell: (info) => <span className="font-mono text-[12px]">{info.getValue()}</span>,
        }),
        helper.accessor("name", {
          id: "name",
          header: "Sport",
          cell: (info) => {
            const sport = info.row.original;
            return (
              <div className="flex min-w-40 items-center gap-2">
                <SportMark name={sport.name} />
                <div className="min-w-0">
                  <Link href={`/sports/${sport.id}`} className="block truncate font-medium hover:underline">
                    {sport.name}
                  </Link>
                  <p className="font-mono text-[11px] text-muted-foreground">{sport.id}</p>
                </div>
              </div>
            );
          },
        }),
        helper.accessor("status", {
          id: "status",
          header: "Status",
          enableSorting: false,
          cell: (info) => <SportStatusBadge status={info.getValue()} />,
        }),
        helper.accessor("competitions", {
          id: "competitions",
          header: "Competitions",
          cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
        }),
        helper.accessor("upcomingEvents", {
          id: "upcomingEvents",
          header: "Upcoming",
          cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
        }),
        helper.accessor("liveEvents", {
          id: "liveEvents",
          header: "Live",
          cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
        }),
        helper.accessor("totalEvents", {
          id: "totalEvents",
          header: "Total events",
          cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
        }),
        helper.accessor("providerName", {
          id: "provider",
          header: "Provider",
          enableSorting: false,
          cell: (info) => info.getValue(),
        }),
        helper.accessor("lastUpdated", {
          id: "lastUpdated",
          header: "Last updated",
          cell: (info) => (
            <span className="font-mono text-[12px] text-muted-foreground">{formatDateTime(info.getValue())}</span>
          ),
        }),
        helper.display({
          id: "actions",
          header: "Actions",
          enableSorting: false,
          cell: (info) => <SportRowMenu sport={info.row.original} />,
        }),
      ]),
    [],
  );

  const snapshot = query.data?.data;
  const rows = snapshot?.items ?? EMPTY_ROWS;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader title="Sports" description="Monitor configured sports, competitions and event activity." />

      {query.isError && !snapshot ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="Sports could not be loaded." />
      ) : null}

      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Configured sports feed. Counts are for this feed, not the dashboard snapshot.</span>
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
            aria-label="Sports summary"
          >
            <MetricCard
              label="Total sports"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.total)}</span>}
              hint="Configured on this feed"
            />
            <MetricCard
              label="Active sports"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.active)}</span>}
              hint="Status active"
            />
            <MetricCard
              label="Active competitions"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.competitions)}</span>}
              hint="Competitions with status active"
            />
            <MetricCard
              label="Upcoming events"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.upcomingEvents)}</span>}
              hint="Scheduled on this feed"
            />
            <MetricCard
              label="Live events"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.liveEvents)}</span>}
              hint="Status live"
            />
            <MetricCard
              label="Suspended events"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.suspendedEvents)}</span>}
              hint="Status suspended"
            />
          </section>

          <FilterBar
            search={params.q}
            onSearch={(value) => params.update({ q: value.trim() ? value : null, page: null })}
            searchPlaceholder="Search sport name or sport ID"
            searchLabel="Search sports"
            status={params.status}
            statusOptions={[
              { value: "all", label: "Any" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "suspended", label: "Suspended" },
            ]}
            onStatus={(value) => params.update({ status: value === "all" ? null : value, page: null })}
            range={params.updated}
            rangePresets={updatedPresets}
            onRange={(value) => params.update({ updated: value === "all" ? null : value, page: null })}
          >
            <Combobox
              label="Provider"
              value={params.provider}
              options={[
                { value: "all", label: "Any" },
                ...snapshot.providers.map((provider) => ({ value: provider.id, label: provider.name })),
              ]}
              onChange={(value) => params.update({ provider: value === "all" ? null : value, page: null })}
            />
            <Combobox
              label="Activity"
              value={params.activity}
              options={[
                { value: "all", label: "Any" },
                { value: "live", label: "Live events" },
                { value: "quiet", label: "No live events" },
              ]}
              onChange={(value) => params.update({ activity: value === "all" ? null : value, page: null })}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={rows}
            caption="Configured sports"
            toolbarLabel="Sports"
            hiddenColumnIds={HIDDEN_COLUMNS}
            pageSizeOptions={[10, 20]}
            page={snapshot.page}
            pageSize={snapshot.pageSize}
            total={snapshot.total}
            sort={{ id: params.sort, desc: params.direction === "desc" }}
            onSortChange={(sort) => {
              if (!sort) return;
              params.update({
                sort: sort.id === "liveEvents" ? null : sort.id,
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
            emptyTitle="No sports found"
            emptyDescription="Try changing your search or filters."
          />
        </>
      ) : null}
    </div>
  );
}
