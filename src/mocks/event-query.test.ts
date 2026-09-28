import { expect, test } from "vitest";
import { PERMISSIONS, can } from "@/config/permissions";
import { eventIdSchema, eventListQuerySchema } from "@/lib/validation/events";
import { seedEventActivity, seedEvents } from "@/mocks/data/events";
import { feedProviders, seedCompetitions, seedSports, SPORTS_AS_OF } from "@/mocks/data/sports";
import {
  MARKETS_UNAVAILABLE,
  assembleEventDetail,
  buildEventViews,
  eventInStartWindow,
  queryEvents,
  summarizeEvents,
} from "@/mocks/event-query";
import { formatElapsed } from "@/lib/format";

function providerName(id: string) {
  return feedProviders.find((provider) => provider.id === id)?.name ?? id;
}

const views = buildEventViews(seedEvents, seedSports, seedCompetitions, providerName);

function events(overrides: Record<string, unknown> = {}) {
  return queryEvents(views, eventListQuerySchema.parse(overrides));
}

test("event summary counts each status separately", () => {
  expect(summarizeEvents(seedEvents)).toEqual({
    total: 16,
    upcoming: 7,
    live: 3,
    completed: 2,
    suspended: 2,
  });
  const suspended = seedEvents.find((event) => event.id === "EVT-10024");
  expect(suspended?.status).toBe("suspended");
  expect(suspended?.status).not.toBe("completed");
  expect(suspended?.status).not.toBe("cancelled");
});

test("event search covers name, id, competition, sport, and provider reference", () => {
  expect(events({ q: "Arsenal" }).items.map((event) => event.id)).toEqual(["EVT-10021"]);
  expect(events({ q: "EVT-10021" }).items).toHaveLength(1);
  expect(events({ q: "COMP-EPL" }).total).toBe(6);
  expect(events({ q: "Premier League" }).total).toBe(7);
  expect(events({ q: "Football" }).total).toBe(7);
  expect(events({ q: "PA-IND-AUS" }).items[0]?.id).toBe("EVT-IND-AUS");
  expect(events({ q: "zzzz" }).total).toBe(0);
});

test("event filters use sport, competition, status, provider, and start window", () => {
  expect(events({ sport: "SPORT-CRICKET", status: "live" }).items.map((event) => event.id)).toEqual([
    "EVT-MI-CSK",
    "EVT-IND-AUS",
  ]);
  expect(events({ competition: "COMP-EPL" }).total).toBe(6);
  expect(events({ provider: "provider-b", status: "live" }).items[0]?.id).toBe("EVT-30002");
  expect(events({ timing: "upcoming" }).total).toBe(7);
  expect(events({ start: "today" }).total).toBe(10);
  expect(events({ start: "7d" }).total).toBe(15);
  expect(events({ start: "30d" }).total).toBe(16);
  expect(eventInStartWindow("2026-09-28T14:00:00.000Z", "today")).toBe(true);
  expect(eventInStartWindow("2026-09-26T11:00:00.000Z", "today")).toBe(false);
});

test("event sorting and pagination return one page", () => {
  const first = events();
  expect(first.total).toBe(16);
  expect(first.items).toHaveLength(10);
  expect(first.items[0]?.id).toBe("EVT-20012");
  const second = events({ page: 2 });
  expect(second.items[0]?.id).toBe("EVT-20013");
  expect(events({ sort: "name", direction: "asc" }).items[0]?.name).toBe("Ascot 15:40");
  expect(events({ sort: "competition", direction: "asc" }).items[0]?.competitionName).toBe("Hockey World Cup");
});

test("event detail keeps participants and provider metadata normalized", () => {
  const united = views.find((event) => event.id === "EVT-10021");
  const racing = views.find((event) => event.id === "EVT-30001");
  const live = views.find((event) => event.id === "EVT-IND-AUS");
  if (!united || !racing || !live) throw new Error("fixture missing");

  const detail = assembleEventDetail(united, seedEventActivity);
  expect(detail.event.name).toBe("Manchester United vs Arsenal");
  expect(detail.event.competitionName).toBe("Premier League");
  expect(detail.event.sportName).toBe("Football");
  expect(detail.participants.map((participant) => participant.role)).toEqual(["home", "away"]);
  expect(detail.provider).toEqual({
    id: "provider-a",
    name: "Feed A",
    eventId: "PA-10021",
    status: "current",
    lastUpdated: united.lastUpdated,
  });
  expect(detail.markets).toEqual({ available: false, message: MARKETS_UNAVAILABLE });
  expect(detail.activity[0]?.action).toBe("EVENT_CREATED");

  const runners = assembleEventDetail(racing, seedEventActivity);
  expect(runners.participants).toHaveLength(4);
  expect(runners.participants.every((participant) => participant.role === "participant")).toBe(true);
  expect(runners.activity).toEqual([]);

  expect(formatElapsed(live.startTime, SPORTS_AS_OF)).toBe("Started 12m ago");
  expect(eventIdSchema.safeParse("not-an-event").success).toBe(false);
  expect(can(["SPORT_VIEW"], PERMISSIONS.EVENT_VIEW)).toBe(false);
});
