import "server-only";

import type { SearchResult } from "@/lib/validation/search";
import {
  eventDetailSchema,
  type EventDetail,
  type EventListQuery,
  type EventListResponse,
  eventListResponseSchema,
} from "@/lib/validation/events";
import { seedEventActivity, seedEvents } from "@/mocks/data/events";
import { feedProviders, seedCompetitions, seedSports, SPORTS_AS_OF } from "@/mocks/data/sports";
import { assembleEventDetail, buildEventViews, queryEvents, summarizeEvents } from "@/mocks/event-query";

type ServiceError = { ok: false; code: "NOT_FOUND"; message: string };
type ServiceOk<T> = { ok: true; data: T };

function providerName(id: string): string {
  return feedProviders.find((provider) => provider.id === id)?.name ?? id;
}

const views = buildEventViews(seedEvents, seedSports, seedCompetitions, providerName);

export function listEventRecords(query: EventListQuery): EventListResponse {
  const result = queryEvents(views, query);
  return eventListResponseSchema.parse({
    source: "mock",
    generatedAt: SPORTS_AS_OF,
    summary: summarizeEvents(seedEvents),
    sports: seedSports.map((sport) => ({ id: sport.id, name: sport.name })),
    competitions: seedCompetitions.map((competition) => ({
      id: competition.id,
      name: competition.name,
      sportId: competition.sportId,
    })),
    providers: feedProviders,
    items: result.items.map((event) => ({
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
    })),
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
}

export function getEventRecord(eventId: string): ServiceOk<EventDetail> | ServiceError {
  const event = views.find((item) => item.id === eventId);
  if (!event) return { ok: false, code: "NOT_FOUND", message: "That event was not found." };
  return {
    ok: true,
    data: eventDetailSchema.parse(assembleEventDetail(event, seedEventActivity)),
  };
}

export function eventSearchHits(): SearchResult[] {
  return views.map((event) => ({
    id: event.id,
    type: "event" as const,
    title: event.name,
    subtitle: `${event.competitionName} · ${event.sportName}`,
    href: `/events/${event.id}`,
  }));
}
