"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { ActivityTimeline } from "@/components/display/activity-timeline";
import { CopyButton } from "@/components/display/copy-button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, QueryFailure } from "@/components/states/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventStatusBadge } from "@/features/events/event-status-badge";
import { getEvent } from "@/lib/api/events";
import { formatDateTime, formatElapsed } from "@/lib/format";
import type { EventDetail } from "@/lib/validation/events";

const tabs = ["overview", "markets", "activity", "provider"] as const;
type EventTab = (typeof tabs)[number];

const roleLabels = {
  home: "Home",
  away: "Away",
  participant: "Participant",
} as const;

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function EventDetailScreen({ eventId }: { eventId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canViewSport = usePermission(PERMISSIONS.SPORT_VIEW);
  const requested = searchParams.get("tab");
  const tab: EventTab = tabs.includes(requested as EventTab) ? (requested as EventTab) : "overview";

  const query = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEvent(eventId),
  });
  const detail = query.data?.data;
  const event = detail?.event;

  function selectTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") params.delete("tab");
    else params.set("tab", value);
    const next = params.toString();
    router.replace(next ? `/events/${eventId}?${next}` : `/events/${eventId}`, { scroll: false });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title={event?.name ?? "Event"}
        description={
          event
            ? `${event.sportName} · ${event.competitionName}`
            : "Event status, participants, and provider reference."
        }
        meta={
          event ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              {canViewSport ? (
                <Link href={`/sports/${event.sportId}`} className="hover:underline">
                  {event.sportName}
                </Link>
              ) : (
                <span>{event.sportName}</span>
              )}
              <span>{event.competitionName}</span>
              <EventStatusBadge status={event.status} />
              <span className="inline-flex items-center gap-1 font-mono">
                {event.id}
                <CopyButton value={event.id} label={`Copy ${event.id}`} />
              </span>
              <span className="font-mono">{formatDateTime(event.startTime)}</span>
              {event.status === "live" && detail ? (
                <span>{formatElapsed(event.startTime, detail.generatedAt)}</span>
              ) : null}
            </span>
          ) : null
        }
      />

      {detail?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Configured event record. Provider fields are normalized metadata from the service.</span>
        </div>
      ) : null}

      {query.isError && !detail ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="This event could not be loaded." />
      ) : null}

      {!detail && query.isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : null}

      {detail && event ? (
        <Tabs value={tab} onValueChange={selectTab}>
          <TabsList className="h-auto w-full max-w-full flex-wrap justify-start">
            {tabs.map((item) => (
              <TabsTrigger key={item} value={item}>
                {item[0]!.toUpperCase() + item.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="overview">
            <Overview detail={detail} />
          </TabsContent>
          <TabsContent value="markets">
            <EmptyState title="Markets" description={detail.markets.message} />
          </TabsContent>
          <TabsContent value="activity">
            {detail.activity.length === 0 ? (
              <EmptyState title="No activity recorded" description="The service has not supplied activity for this event." />
            ) : (
              <div className="rounded-md border border-border bg-card p-4">
                <ActivityTimeline items={detail.activity} />
              </div>
            )}
          </TabsContent>
          <TabsContent value="provider">
            <ProviderTab detail={detail} />
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}

function Overview({ detail }: { detail: EventDetail }) {
  const event = detail.event;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <dl className="overflow-hidden rounded-md border border-border bg-card">
        <Fact label="Sport" value={event.sportName} />
        <Fact label="Competition" value={event.competitionName} />
        <Fact label="Event" value={event.name} />
        <Fact label="Event ID" value={event.id} />
        <Fact label="Provider" value={event.providerName} />
        <Fact label="Status" value={event.status} />
        <Fact label="Start time" value={formatDateTime(event.startTime)} />
        <Fact label="Last updated" value={formatDateTime(event.lastUpdated)} />
      </dl>
      <section className="overflow-hidden rounded-md border border-border bg-card">
        <h2 className="border-b border-border px-4 py-2.5 text-sm font-semibold">Participants</h2>
        {detail.participants.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No participants were supplied.</p>
        ) : (
          <ul className="divide-y divide-border">
            {detail.participants.map((participant) => (
              <li key={participant.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <div>
                  <p className="font-medium">{participant.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{participant.shortName}</p>
                </div>
                <span className="text-xs tracking-wide text-muted-foreground uppercase">{roleLabels[participant.role]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ProviderTab({ detail }: { detail: EventDetail }) {
  return (
    <dl className="overflow-hidden rounded-md border border-border bg-card">
      <Fact label="Provider" value={detail.provider.name} />
      <Fact label="Provider event ID" value={detail.provider.eventId} />
      <Fact label="Provider status" value={detail.provider.status} />
      <Fact label="Last provider update" value={formatDateTime(detail.provider.lastUpdated)} />
    </dl>
  );
}
