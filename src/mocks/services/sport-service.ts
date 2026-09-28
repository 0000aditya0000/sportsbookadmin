import "server-only";

import type { SearchResult } from "@/lib/validation/search";
import {
  sportDetailSchema,
  sportListResponseSchema,
  type SportDetail,
  type SportListQuery,
  type SportListResponse,
} from "@/lib/validation/sports";
import { seedEvents } from "@/mocks/data/events";
import {
  feedProviders,
  seedCompetitions,
  seedSportActivity,
  seedSports,
  SPORTS_AS_OF,
} from "@/mocks/data/sports";
import { assembleSportDetail, buildSportViews, querySports, summarizeSports } from "@/mocks/sport-query";

type ServiceError = { ok: false; code: "NOT_FOUND"; message: string };
type ServiceOk<T> = { ok: true; data: T };

function providerName(id: string): string {
  return feedProviders.find((provider) => provider.id === id)?.name ?? id;
}

const views = buildSportViews(seedSports, seedCompetitions, seedEvents, providerName);

export function listSportRecords(query: SportListQuery): SportListResponse {
  const summary = summarizeSports(seedSports, seedCompetitions, seedEvents);
  const result = querySports(views, query);
  return sportListResponseSchema.parse({
    source: "mock",
    generatedAt: SPORTS_AS_OF,
    summary,
    providers: feedProviders,
    items: result.items.map((sport) => ({
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
    })),
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
}

export function getSportRecord(sportId: string): ServiceOk<SportDetail> | ServiceError {
  const sport = views.find((item) => item.id === sportId);
  if (!sport) return { ok: false, code: "NOT_FOUND", message: "That sport was not found." };
  return {
    ok: true,
    data: sportDetailSchema.parse(
      assembleSportDetail(sport, seedCompetitions, seedEvents, seedSportActivity, providerName),
    ),
  };
}

export function sportSearchHits(): SearchResult[] {
  return views.map((sport) => ({
    id: sport.id,
    type: "sport" as const,
    title: sport.name,
    subtitle: `${sport.id} · ${sport.status}`,
    href: `/sports/${sport.id}`,
  }));
}
