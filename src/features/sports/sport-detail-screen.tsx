"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { ActivityTimeline } from "@/components/display/activity-timeline";
import { CopyButton } from "@/components/display/copy-button";
import { MetricCard } from "@/components/display/metric-card";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, QueryFailure } from "@/components/states/feedback-states";
import { createDataColumns, DataTable } from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventStatusBadge } from "@/features/events/event-status-badge";
import { SportMark } from "@/features/sports/sport-mark";
import { SportStatusBadge } from "@/features/sports/sport-status-badge";
import { getSport } from "@/lib/api/sports";
import { formatCount, formatDateTime } from "@/lib/format";
import type { CompetitionView, SportDetail } from "@/lib/validation/sports";
import type { EventStatus } from "@/lib/validation/events";

const tabs = ["overview", "competitions", "events", "activity"] as const;
type SportTab = (typeof tabs)[number];

const tabLabels: Record<SportTab, string> = {
  overview: "Overview",
  competitions: "Competitions",
  events: "Events",
  activity: "Activity",
};

const competitionHelper = createDataColumns<CompetitionView>();
const competitionColumns = competitionHelper.columns([
  competitionHelper.accessor("name", {
    header: "Competition",
    enableSorting: false,
    cell: (info) => {
      const competition = info.row.original;
      return (
        <div className="min-w-40">
          <Link href={`/events?competition=${competition.id}`} className="font-medium hover:underline">
            {competition.name}
          </Link>
          <p className="font-mono text-[11px] text-muted-foreground">{competition.id}</p>
          <p className="text-xs text-muted-foreground">{competition.region}</p>
        </div>
      );
    },
  }),
  competitionHelper.accessor("status", {
    header: "Status",
    enableSorting: false,
    cell: (info) => <SportStatusBadge status={info.getValue()} />,
  }),
  competitionHelper.accessor("eventCount", {
    header: "Events",
    enableSorting: false,
    cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
  }),
  competitionHelper.accessor("upcomingEventCount", {
    header: "Upcoming",
    enableSorting: false,
    cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
  }),
  competitionHelper.accessor("liveEventCount", {
    header: "Live",
    enableSorting: false,
    cell: (info) => <span className="tabular-nums">{formatCount(info.getValue())}</span>,
  }),
  competitionHelper.accessor("providerName", { header: "Provider", enableSorting: false }),
  competitionHelper.accessor("lastUpdated", {
    header: "Last updated",
    enableSorting: false,
    cell: (info) => (
      <span className="font-mono text-[12px] text-muted-foreground">{formatDateTime(info.getValue())}</span>
    ),
  }),
]);

const eventHelper = createDataColumns<SportDetail["events"][number]>();
const eventColumns = eventHelper.columns([
  eventHelper.accessor("name", {
    header: "Event",
    enableSorting: false,
    cell: (info) => (
      <div className="min-w-40">
        <Link href={`/events/${info.row.original.id}`} className="font-medium hover:underline">
          {info.getValue()}
        </Link>
        <p className="font-mono text-[11px] text-muted-foreground">{info.row.original.id}</p>
      </div>
    ),
  }),
  eventHelper.accessor("competitionName", { header: "Competition", enableSorting: false }),
  eventHelper.accessor("status", {
    header: "Status",
    enableSorting: false,
    cell: (info) => <EventStatusBadge status={info.getValue() as EventStatus} />,
  }),
  eventHelper.accessor("startTime", {
    header: "Start",
    enableSorting: false,
    cell: (info) => (
      <span className="font-mono text-[12px] text-muted-foreground">{formatDateTime(info.getValue())}</span>
    ),
  }),
  eventHelper.accessor("providerName", { header: "Provider", enableSorting: false }),
]);

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function SportDetailScreen({ sportId }: { sportId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canViewEvents = usePermission(PERMISSIONS.EVENT_VIEW);
  const requested = searchParams.get("tab");
  const tab: SportTab = tabs.includes(requested as SportTab) ? (requested as SportTab) : "overview";

  const query = useQuery({
    queryKey: ["sport", sportId],
    queryFn: () => getSport(sportId),
  });
  const detail = query.data?.data;
  const sport = detail?.sport;

  function selectTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") params.delete("tab");
    else params.set("tab", value);
    const next = params.toString();
    router.replace(next ? `/sports/${sportId}?${next}` : `/sports/${sportId}`, { scroll: false });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title={sport?.name ?? "Sport"}
        description={sport ? sport.providerName : "Competitions and events for a configured sport."}
        meta={
          sport ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              <SportMark name={sport.name} />
              <SportStatusBadge status={sport.status} />
              <span className="inline-flex items-center gap-1 font-mono">
                {sport.id}
                <CopyButton value={sport.id} label={`Copy ${sport.id}`} />
              </span>
            </span>
          ) : null
        }
        actions={
          sport && canViewEvents ? (
            <Button asChild>
              <Link href={`/events?sport=${sport.id}`}>View events</Link>
            </Button>
          ) : null
        }
      />

      {detail?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Configured sport record. Counts are supplied by the sports service.</span>
        </div>
      ) : null}

      {query.isError && !detail ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="This sport could not be loaded." />
      ) : null}

      {!detail && query.isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : null}

      {detail && sport ? (
        <>
          <section
            className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Sport activity"
          >
            <MetricCard
              label="Competitions"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(sport.competitions)}</span>}
              hint="On this sport"
            />
            <MetricCard
              label="Upcoming events"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(sport.upcomingEvents)}</span>}
              hint="Scheduled"
            />
            <MetricCard
              label="Live events"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(sport.liveEvents)}</span>}
              hint="Status live"
            />
            <MetricCard
              label="Total events"
              value={<span className="text-xl font-semibold tabular-nums">{formatCount(sport.totalEvents)}</span>}
              hint={`Updated ${formatDateTime(sport.lastUpdated)}`}
            />
          </section>

          <Tabs value={tab} onValueChange={selectTab}>
            <TabsList className="h-auto w-full max-w-full flex-wrap justify-start">
              {tabs.map((item) => (
                <TabsTrigger key={item} value={item}>
                  {tabLabels[item]}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview">
              <dl className="overflow-hidden rounded-md border border-border bg-card">
                <Fact label="Sport" value={sport.name} />
                <Fact label="Sport ID" value={sport.id} />
                <Fact label="Status" value={sport.status} />
                <Fact label="Provider" value={sport.providerName} />
                <Fact label="Configured" value={formatDateTime(sport.configuredAt)} />
                <Fact label="Last updated" value={formatDateTime(sport.lastUpdated)} />
              </dl>
            </TabsContent>
            <TabsContent value="competitions">
              <DataTable
                columns={competitionColumns}
                data={detail.competitions}
                caption="Competitions"
                toolbarLabel="Competitions"
                page={1}
                pageSize={Math.max(detail.competitions.length, 1)}
                total={detail.competitions.length}
                onPageChange={() => undefined}
                emptyTitle="No competitions"
                emptyDescription="This sport has no competitions on the feed."
              />
            </TabsContent>
            <TabsContent value="events">
              <DataTable
                columns={eventColumns}
                data={detail.events}
                caption="Events for this sport"
                toolbarLabel="Events"
                page={1}
                pageSize={Math.max(detail.events.length, 1)}
                total={detail.events.length}
                onPageChange={() => undefined}
                emptyTitle="No events"
                emptyDescription="This sport has no events on the feed."
              />
            </TabsContent>
            <TabsContent value="activity">
              {detail.activity.length === 0 ? (
                <EmptyState title="No activity recorded" description="The service has not supplied activity for this sport." />
              ) : (
                <div className="rounded-md border border-border bg-card p-4">
                  <ActivityTimeline items={detail.activity} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}
