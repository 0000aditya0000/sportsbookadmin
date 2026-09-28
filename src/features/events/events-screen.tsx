"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MetricCard } from "@/components/display/metric-card";
import { FilterBar } from "@/components/forms/filter-bar";
import { PageHeader } from "@/components/layout/page-header";
import { QueryFailure } from "@/components/states/feedback-states";
import { createDataColumns, DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { EventQuickView } from "@/features/events/event-quick-view";
import { EventRowMenu } from "@/features/events/event-row-menu";
import { EventStatusBadge } from "@/features/events/event-status-badge";
import { useEventParams } from "@/hooks/use-event-params";
import { listEvents } from "@/lib/api/events";
import { formatCount, formatDateTime, formatElapsed } from "@/lib/format";
import type { EventListItem } from "@/lib/validation/events";

const helper = createDataColumns<EventListItem>();
const EMPTY_ROWS: EventListItem[] = [];
const HIDDEN_COLUMNS = ["id"];

const startPresets = [
  { value: "all", label: "Any start", hint: "All start times" },
  { value: "today", label: "Today", hint: "Starts on the operations day" },
  { value: "7d", label: "7 days", hint: "Starts within the next week" },
  { value: "30d", label: "30 days", hint: "Starts within the next month" },
];

export function EventsScreen() {
  const params = useEventParams();
  const [quickView, setQuickView] = useState<EventListItem | null>(null);
  const listQuery = {
    page: params.page,
    pageSize: params.pageSize,
    q: params.q,
    sport: params.sport,
    competition: params.competition,
    status: params.status,
    provider: params.provider,
    start: params.start,
    timing: params.timing,
    sort: params.sort,
    direction: params.direction,
  } as const;

  const query = useQuery({
    queryKey: ["events", listQuery],
    queryFn: () => listEvents(listQuery),
    placeholderData: keepPreviousData,
  });

  const snapshot = query.data?.data;
  const asOf = snapshot?.generatedAt;

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("id", {
          id: "id",
          header: "Event ID",
          enableSorting: false,
          cell: (info) => <span className="font-mono text-[12px]">{info.getValue()}</span>,
        }),
        helper.accessor("name", {
          id: "name",
          header: "Event",
          cell: (info) => {
            const event = info.row.original;
            return (
              <div className="min-w-48">
                <Link href={`/events/${event.id}`} className="block font-medium hover:underline">
                  {event.name}
                </Link>
                <p className="font-mono text-[11px] text-muted-foreground">{event.id}</p>
              </div>
            );
          },
        }),
        helper.accessor("competitionName", {
          id: "competition",
          header: "Competition",
          cell: (info) => (
            <div className="min-w-36">
              <p>{info.getValue()}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{info.row.original.competitionId}</p>
            </div>
          ),
        }),
        helper.accessor("sportName", {
          id: "sport",
          header: "Sport",
          enableSorting: false,
          cell: (info) => (
            <Link href={`/sports/${info.row.original.sportId}`} className="hover:underline">
              {info.getValue()}
            </Link>
          ),
        }),
        helper.accessor("status", {
          id: "status",
          header: "Status",
          cell: (info) => <EventStatusBadge status={info.getValue()} />,
        }),
        helper.accessor("startTime", {
          id: "startTime",
          header: "Start time",
          cell: (info) => {
            const event = info.row.original;
            return (
              <div>
                <p className="font-mono text-[12px]">{formatDateTime(event.startTime)}</p>
                {event.status === "live" && asOf ? (
                  <p className="text-[11px] text-muted-foreground">{formatElapsed(event.startTime, asOf)}</p>
                ) : null}
              </div>
            );
          },
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
          cell: (info) => <EventRowMenu event={info.row.original} onQuickView={setQuickView} />,
        }),
      ]),
    [asOf],
  );

  const rows = snapshot?.items ?? EMPTY_ROWS;
  const competitions = snapshot
    ? snapshot.competitions.filter((competition) => params.sport === "all" || competition.sportId === params.sport)
    : [];
  const emptyTitle = params.status === "live" || params.timing === "live" ? "No live events" : "No events found";
  const emptyDescription =
    params.status === "live" || params.timing === "live"
      ? "There are currently no live events matching these filters."
      : "Try adjusting the sport, competition, status, or date range.";

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Events"
        description="Monitor scheduled and live sporting events across configured competitions."
      />

      {query.isError && !snapshot ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="Events could not be loaded." />
      ) : null}

      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Configured events feed. Totals are for this feed, not the dashboard snapshot.</span>
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
            aria-label="Event summary"
          >
            <MetricCard
              label="Total events"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.total)}</span>}
              hint="On this feed"
            />
            <MetricCard
              label="Upcoming"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.upcoming)}</span>}
              hint="Scheduled"
            />
            <MetricCard
              label="Live"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.live)}</span>}
              hint="Status live"
            />
            <MetricCard
              label="Completed"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.completed)}</span>}
              hint="Status completed"
            />
            <MetricCard
              label="Suspended"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(snapshot.summary.suspended)}</span>}
              hint="Status suspended"
            />
          </section>

          <FilterBar
            search={params.q}
            onSearch={(value) => params.update({ q: value.trim() ? value : null, page: null })}
            searchPlaceholder="Search event, competition, sport, or provider reference"
            searchLabel="Search events"
            status={params.status}
            statusOptions={[
              { value: "all", label: "Any" },
              { value: "scheduled", label: "Scheduled" },
              { value: "live", label: "Live" },
              { value: "completed", label: "Completed" },
              { value: "suspended", label: "Suspended" },
              { value: "cancelled", label: "Cancelled" },
              { value: "postponed", label: "Postponed" },
            ]}
            onStatus={(value) => params.update({ status: value === "all" ? null : value, page: null })}
            range={params.start}
            rangePresets={startPresets}
            onRange={(value) => params.update({ start: value === "all" ? null : value, page: null })}
          >
            <Combobox
              label="Sport"
              value={params.sport}
              options={[
                { value: "all", label: "Any" },
                ...snapshot.sports.map((sport) => ({ value: sport.id, label: sport.name })),
              ]}
              onChange={(value) =>
                params.update({
                  sport: value === "all" ? null : value,
                  competition: null,
                  page: null,
                })
              }
            />
            <Combobox
              label="Competition"
              value={params.competition}
              options={[
                { value: "all", label: "Any" },
                ...competitions.map((competition) => ({ value: competition.id, label: competition.name })),
              ]}
              onChange={(value) => params.update({ competition: value === "all" ? null : value, page: null })}
            />
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
              label="Timing"
              value={params.timing}
              options={[
                { value: "all", label: "Any" },
                { value: "live", label: "Live" },
                { value: "upcoming", label: "Upcoming" },
              ]}
              onChange={(value) => params.update({ timing: value === "all" ? null : value, page: null })}
            />
          </FilterBar>

          <DataTable
            columns={columns}
            data={rows}
            caption="Sporting events"
            toolbarLabel="Events"
            hiddenColumnIds={HIDDEN_COLUMNS}
            pageSizeOptions={[10, 20]}
            page={snapshot.page}
            pageSize={snapshot.pageSize}
            total={snapshot.total}
            sort={{ id: params.sort, desc: params.direction === "desc" }}
            onSortChange={(sort) => {
              if (!sort) return;
              params.update({
                sort: sort.id === "startTime" ? null : sort.id,
                direction: sort.desc ? "desc" : null,
                page: null,
              });
            }}
            onPageChange={(page) => params.update({ page: page <= 1 ? null : String(page) })}
            onPageSizeChange={(pageSize) =>
              params.update({ pageSize: pageSize === 10 ? null : String(pageSize), page: null })
            }
            isLoading={query.isFetching}
            onRetry={() => void query.refetch()}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
          />
        </>
      ) : null}

      {quickView && snapshot ? (
        <EventQuickView
          key={quickView.id}
          event={quickView}
          asOf={snapshot.generatedAt}
          onOpenChange={(open) => {
            if (!open) setQuickView(null);
          }}
        />
      ) : null}
    </div>
  );
}
