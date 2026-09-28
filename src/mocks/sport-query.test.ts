import { expect, test } from "vitest";
import { PERMISSIONS, can } from "@/config/permissions";
import { eventListQuerySchema } from "@/lib/validation/events";
import { sportIdSchema, sportListQuerySchema } from "@/lib/validation/sports";
import { seedEvents } from "@/mocks/data/events";
import { feedProviders, seedCompetitions, seedSports } from "@/mocks/data/sports";
import { buildSportViews, querySports, summarizeSports } from "@/mocks/sport-query";

function providerName(id: string) {
  return feedProviders.find((provider) => provider.id === id)?.name ?? id;
}

const views = buildSportViews(seedSports, seedCompetitions, seedEvents, providerName);

function sports(overrides: Record<string, unknown> = {}) {
  return querySports(views, sportListQuerySchema.parse(overrides));
}

test("sports list is the configured feed, not a dashboard total", () => {
  const summary = summarizeSports(seedSports, seedCompetitions, seedEvents);
  expect(summary).toEqual({
    total: 6,
    active: 4,
    competitions: 6,
    upcomingEvents: 7,
    liveEvents: 3,
    suspendedEvents: 2,
  });
  expect(sports().total).toBe(6);
  expect(sports().items[0]?.id).toBe("SPORT-CRICKET");
});

test("sports filters stay on the service query", () => {
  expect(sports({ status: "active" }).total).toBe(4);
  expect(sports({ provider: "provider-a" }).items.map((sport) => sport.id)).toEqual([
    "SPORT-CRICKET",
    "SPORT-FOOTBALL",
    "SPORT-BASKETBALL",
  ]);
  expect(sports({ activity: "live" }).items.map((sport) => sport.id)).toEqual(["SPORT-CRICKET", "SPORT-RACING"]);
  expect(sports({ q: "SPORT-FOOTBALL" }).items.map((sport) => sport.name)).toEqual(["Football"]);
  expect(sports({ q: "zzzz" }).total).toBe(0);
  expect(sports({ updated: "7d" }).total).toBe(4);
  expect(sports({ updated: "30d" }).items.some((sport) => sport.id === "SPORT-HOCKEY")).toBe(true);
  expect(sports({ updated: "30d" }).items.some((sport) => sport.id === "SPORT-BASKETBALL")).toBe(false);
});

test("sports sorting and pagination return one page", () => {
  const page = sports({ sort: "liveEvents", direction: "asc", page: 2, pageSize: 2 });
  expect(page.total).toBe(6);
  expect(page.items.map((sport) => sport.id)).toEqual(["SPORT-HOCKEY", "SPORT-TENNIS"]);
  expect(sports({ sort: "name", direction: "asc" }).items[0]?.name).toBe("Basketball");
});

test("an unknown sport id is rejected before lookup", () => {
  expect(sportIdSchema.safeParse("football").success).toBe(false);
  expect(sportIdSchema.safeParse("SPORT-FOOTBALL").success).toBe(true);
  expect(can(["DASHBOARD_VIEW"], PERMISSIONS.SPORT_VIEW)).toBe(false);
});

test("event list defaults match the URL convention", () => {
  expect(eventListQuerySchema.parse({})).toMatchObject({
    page: 1,
    pageSize: 10,
    sport: "all",
    status: "all",
    sort: "startTime",
    direction: "asc",
  });
});
