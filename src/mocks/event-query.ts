import { SPORTS_AS_OF } from "@/mocks/data/sports";
import type { CompetitionRecord, SportRecord } from "@/mocks/data/sports";
import type { EventActivityRecord, EventRecord, EventStatus } from "@/mocks/data/events";
import type { EventDetail, EventListQuery } from "@/lib/validation/events";

const AS_OF_MS = Date.parse(SPORTS_AS_OF);
const DAY_MS = 86_400_000;

export type EventView = EventRecord & {
  sportName: string;
  competitionName: string;
  providerName: string;
};

export function buildEventViews(
  events: readonly EventRecord[],
  sports: readonly SportRecord[],
  competitions: readonly CompetitionRecord[],
  providerName: (id: string) => string,
): EventView[] {
  const sportName = new Map(sports.map((sport) => [sport.id, sport.name]));
  const competitionName = new Map(competitions.map((competition) => [competition.id, competition.name]));
  return events.map((event) => ({
    ...event,
    sportName: sportName.get(event.sportId) ?? event.sportId,
    competitionName: competitionName.get(event.competitionId) ?? event.competitionId,
    providerName: providerName(event.providerId),
  }));
}

export function summarizeEvents(events: readonly EventRecord[]) {
  const count = (status: EventStatus) => events.filter((event) => event.status === status).length;
  return {
    total: events.length,
    upcoming: count("scheduled"),
    live: count("live"),
    completed: count("completed"),
    suspended: count("suspended"),
  };
}

function istDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function eventInStartWindow(startTime: string, start: EventListQuery["start"]): boolean {
  if (start === "all") return true;
  const startMs = Date.parse(startTime);
  if (start === "today") return istDay(startTime) === istDay(SPORTS_AS_OF);
  if (start === "7d") return startMs >= AS_OF_MS - DAY_MS && startMs <= AS_OF_MS + 7 * DAY_MS;
  return startMs >= AS_OF_MS - 7 * DAY_MS && startMs <= AS_OF_MS + 30 * DAY_MS;
}

function matches(event: EventView, query: EventListQuery): boolean {
  if (query.sport !== "all" && event.sportId !== query.sport) return false;
  if (query.competition !== "all" && event.competitionId !== query.competition) return false;
  if (query.status !== "all" && event.status !== query.status) return false;
  if (query.provider !== "all" && event.providerId !== query.provider) return false;
  if (query.timing === "live" && event.status !== "live") return false;
  if (query.timing === "upcoming" && event.status !== "scheduled") return false;
  if (!eventInStartWindow(event.startTime, query.start)) return false;
  const needle = query.q.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    event.id,
    event.name,
    event.sportName,
    event.sportId,
    event.competitionName,
    event.competitionId,
    event.providerName,
    event.providerId,
    event.providerEventId,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

function compare(left: EventView, right: EventView, query: EventListQuery): number {
  const direction = query.direction === "asc" ? 1 : -1;
  let delta = 0;
  switch (query.sort) {
    case "startTime":
      delta = Date.parse(left.startTime) - Date.parse(right.startTime);
      break;
    case "name":
      delta = left.name.localeCompare(right.name);
      break;
    case "competition":
      delta = left.competitionName.localeCompare(right.competitionName);
      break;
    case "status":
      delta = left.status.localeCompare(right.status);
      break;
    case "lastUpdated":
      delta = Date.parse(left.lastUpdated) - Date.parse(right.lastUpdated);
      break;
    default: {
      const unreachable: never = query.sort;
      return unreachable;
    }
  }
  if (delta === 0) delta = left.id.localeCompare(right.id);
  return delta * direction;
}

export function queryEvents(events: readonly EventView[], query: EventListQuery) {
  const filtered = events.filter((event) => matches(event, query));
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

export const MARKETS_UNAVAILABLE = "Market operations are introduced in a later Meridian release.";

export function assembleEventDetail(
  event: EventView,
  activity: readonly EventActivityRecord[],
): EventDetail {
  return {
    source: "mock",
    generatedAt: SPORTS_AS_OF,
    event: {
      id: event.id,
      name: event.name,
      sportId: event.sportId,
      sportName: event.sportName,
      competitionId: event.competitionId,
      competitionName: event.competitionName,
      status: event.status,
      startTime: event.startTime,
      providerId: event.providerId,
      providerName: event.providerName,
      providerEventId: event.providerEventId,
      lastUpdated: event.lastUpdated,
    },
    participants: event.participants,
    provider: {
      id: event.providerId,
      name: event.providerName,
      eventId: event.providerEventId,
      status: event.providerStatus,
      lastUpdated: event.lastUpdated,
    },
    activity: activity
      .filter((item) => item.eventId === event.id)
      .sort((left, right) => Date.parse(right.at) - Date.parse(left.at))
      .map((item) => ({
        id: item.id,
        action: item.action,
        title: item.title,
        detail: activityDetail(item.source, item.action, item.reference),
        at: item.at,
      })),
    markets: { available: false, message: MARKETS_UNAVAILABLE },
  };
}
