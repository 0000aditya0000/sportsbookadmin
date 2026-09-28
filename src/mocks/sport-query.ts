import type { CompetitionRecord, SportActivityRecord, SportRecord } from "@/mocks/data/sports";
import { SPORTS_AS_OF } from "@/mocks/data/sports";
import type { EventRecord } from "@/mocks/data/events";
import type { SportDetail, SportListQuery } from "@/lib/validation/sports";

const AS_OF_MS = Date.parse(SPORTS_AS_OF);
const DAY_MS = 86_400_000;

export type SportView = SportRecord & {
  providerName: string;
  competitions: number;
  upcomingEvents: number;
  liveEvents: number;
  totalEvents: number;
};

export function countEvents(events: readonly EventRecord[], sportId: string, competitionId?: string) {
  const rows = events.filter(
    (event) => event.sportId === sportId && (competitionId === undefined || event.competitionId === competitionId),
  );
  return {
    total: rows.length,
    upcoming: rows.filter((event) => event.status === "scheduled").length,
    live: rows.filter((event) => event.status === "live").length,
    suspended: rows.filter((event) => event.status === "suspended").length,
  };
}

export function buildSportViews(
  sports: readonly SportRecord[],
  competitions: readonly CompetitionRecord[],
  events: readonly EventRecord[],
  providerName: (id: string) => string,
): SportView[] {
  return sports.map((sport) => {
    const counts = countEvents(events, sport.id);
    return {
      ...sport,
      providerName: providerName(sport.providerId),
      competitions: competitions.filter((competition) => competition.sportId === sport.id).length,
      upcomingEvents: counts.upcoming,
      liveEvents: counts.live,
      totalEvents: counts.total,
    };
  });
}

export function summarizeSports(
  sports: readonly SportRecord[],
  competitions: readonly CompetitionRecord[],
  events: readonly EventRecord[],
) {
  return {
    total: sports.length,
    active: sports.filter((sport) => sport.status === "active").length,
    competitions: competitions.filter((competition) => competition.status === "active").length,
    upcomingEvents: events.filter((event) => event.status === "scheduled").length,
    liveEvents: events.filter((event) => event.status === "live").length,
    suspendedEvents: events.filter((event) => event.status === "suspended").length,
  };
}

function updatedCutoff(updated: SportListQuery["updated"]): number | null {
  if (updated === "all") return null;
  const days = updated === "7d" ? 7 : updated === "30d" ? 30 : 90;
  return AS_OF_MS - days * DAY_MS;
}

function matches(sport: SportView, query: SportListQuery): boolean {
  if (query.status !== "all" && sport.status !== query.status) return false;
  if (query.provider !== "all" && sport.providerId !== query.provider) return false;
  if (query.activity === "live" && sport.liveEvents === 0) return false;
  if (query.activity === "quiet" && sport.liveEvents > 0) return false;
  const cutoff = updatedCutoff(query.updated);
  if (cutoff !== null && Date.parse(sport.lastUpdated) < cutoff) return false;
  const needle = query.q.trim().toLowerCase();
  if (!needle) return true;
  return `${sport.id} ${sport.name}`.toLowerCase().includes(needle);
}

function compare(left: SportView, right: SportView, query: SportListQuery): number {
  const direction = query.direction === "asc" ? 1 : -1;
  let delta = 0;
  switch (query.sort) {
    case "name":
      delta = left.name.localeCompare(right.name);
      break;
    case "competitions":
      delta = left.competitions - right.competitions;
      break;
    case "upcomingEvents":
      delta = left.upcomingEvents - right.upcomingEvents;
      break;
    case "liveEvents":
      delta = left.liveEvents - right.liveEvents;
      break;
    case "totalEvents":
      delta = left.totalEvents - right.totalEvents;
      break;
    case "lastUpdated":
      delta = Date.parse(left.lastUpdated) - Date.parse(right.lastUpdated);
      break;
    default: {
      const unreachable: never = query.sort;
      return unreachable;
    }
  }
  if (delta === 0) delta = left.name.localeCompare(right.name);
  return delta * direction;
}

export function querySports(sports: readonly SportView[], query: SportListQuery) {
  const filtered = sports.filter((sport) => matches(sport, query));
  const sorted = [...filtered].sort((left, right) => compare(left, right, query));
  const start = (query.page - 1) * query.pageSize;
  return { items: sorted.slice(start, start + query.pageSize), total: sorted.length };
}

function activityDetail(source: string | null, action: string, reference: string | null): string {
  const parts = [action];
  if (source) parts.push(source);
  if (reference) parts.push(reference);
  return parts.join(" · ");
}

export function assembleSportDetail(
  sport: SportView,
  competitions: readonly CompetitionRecord[],
  events: readonly EventRecord[],
  activity: readonly SportActivityRecord[],
  providerName: (id: string) => string,
): SportDetail {
  const competitionViews = competitions
    .filter((competition) => competition.sportId === sport.id)
    .map((competition) => {
      const counts = countEvents(events, sport.id, competition.id);
      return {
        id: competition.id,
        sportId: competition.sportId,
        name: competition.name,
        region: competition.region,
        status: competition.status,
        providerId: competition.providerId,
        providerName: providerName(competition.providerId),
        eventCount: counts.total,
        upcomingEventCount: counts.upcoming,
        liveEventCount: counts.live,
        lastUpdated: competition.lastUpdated,
      };
    });

  return {
    source: "mock",
    generatedAt: SPORTS_AS_OF,
    sport: {
      id: sport.id,
      name: sport.name,
      status: sport.status,
      providerId: sport.providerId,
      providerName: sport.providerName,
      competitions: sport.competitions,
      upcomingEvents: sport.upcomingEvents,
      liveEvents: sport.liveEvents,
      totalEvents: sport.totalEvents,
      lastUpdated: sport.lastUpdated,
      configuredAt: sport.configuredAt,
    },
    competitions: competitionViews,
    events: events
      .filter((event) => event.sportId === sport.id)
      .map((event) => ({
        id: event.id,
        name: event.name,
        competitionId: event.competitionId,
        competitionName:
          competitionViews.find((competition) => competition.id === event.competitionId)?.name ?? event.competitionId,
        status: event.status,
        startTime: event.startTime,
        providerName: providerName(event.providerId),
      })),
    activity: activity
      .filter((item) => item.sportId === sport.id)
      .sort((left, right) => Date.parse(right.at) - Date.parse(left.at))
      .map((item) => ({
        id: item.id,
        action: item.action,
        title: item.title,
        detail: activityDetail(item.source, item.action, item.reference),
        at: item.at,
      })),
  };
}
