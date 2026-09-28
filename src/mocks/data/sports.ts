export const SPORTS_AS_OF = "2026-09-28T08:15:00.000Z";

export type SportStatus = "active" | "inactive" | "suspended";
export type CompetitionStatus = "active" | "inactive" | "suspended";

export type ProviderRecord = {
  id: string;
  name: string;
};

export type SportRecord = {
  id: string;
  name: string;
  status: SportStatus;
  providerId: string;
  configuredAt: string;
  lastUpdated: string;
};

export type CompetitionRecord = {
  id: string;
  sportId: string;
  name: string;
  region: string;
  status: CompetitionStatus;
  providerId: string;
  lastUpdated: string;
};

export type SportActivityRecord = {
  id: string;
  sportId: string;
  action: string;
  title: string;
  at: string;
  source: string | null;
  reference: string | null;
};

export const feedProviders: ProviderRecord[] = [
  { id: "provider-a", name: "Feed A" },
  { id: "provider-b", name: "Feed B" },
];

export const seedSports: SportRecord[] = [
  {
    id: "SPORT-FOOTBALL",
    name: "Football",
    status: "active",
    providerId: "provider-a",
    configuredAt: "2025-08-01T04:00:00.000Z",
    lastUpdated: "2026-09-28T08:10:00.000Z",
  },
  {
    id: "SPORT-CRICKET",
    name: "Cricket",
    status: "active",
    providerId: "provider-a",
    configuredAt: "2025-08-01T04:00:00.000Z",
    lastUpdated: "2026-09-28T08:12:00.000Z",
  },
  {
    id: "SPORT-TENNIS",
    name: "Tennis",
    status: "active",
    providerId: "provider-b",
    configuredAt: "2025-09-12T06:00:00.000Z",
    lastUpdated: "2026-09-28T07:50:00.000Z",
  },
  {
    id: "SPORT-RACING",
    name: "Horse Racing",
    status: "active",
    providerId: "provider-b",
    configuredAt: "2025-10-03T06:00:00.000Z",
    lastUpdated: "2026-09-28T08:08:00.000Z",
  },
  {
    id: "SPORT-BASKETBALL",
    name: "Basketball",
    status: "inactive",
    providerId: "provider-a",
    configuredAt: "2025-11-01T06:00:00.000Z",
    lastUpdated: "2026-06-01T04:00:00.000Z",
  },
  {
    id: "SPORT-HOCKEY",
    name: "Hockey",
    status: "suspended",
    providerId: "provider-b",
    configuredAt: "2026-01-15T06:00:00.000Z",
    lastUpdated: "2026-09-20T08:15:00.000Z",
  },
];

export const seedCompetitions: CompetitionRecord[] = [
  {
    id: "COMP-EPL",
    sportId: "SPORT-FOOTBALL",
    name: "Premier League",
    region: "England",
    status: "active",
    providerId: "provider-a",
    lastUpdated: "2026-09-28T08:10:00.000Z",
  },
  {
    id: "COMP-LALIGA",
    sportId: "SPORT-FOOTBALL",
    name: "La Liga",
    region: "Spain",
    status: "active",
    providerId: "provider-b",
    lastUpdated: "2026-09-28T07:40:00.000Z",
  },
  {
    id: "COMP-IPL",
    sportId: "SPORT-CRICKET",
    name: "Indian Premier League",
    region: "India",
    status: "active",
    providerId: "provider-a",
    lastUpdated: "2026-09-28T08:05:00.000Z",
  },
  {
    id: "COMP-INTL",
    sportId: "SPORT-CRICKET",
    name: "International Cricket",
    region: "International",
    status: "active",
    providerId: "provider-a",
    lastUpdated: "2026-09-28T08:12:00.000Z",
  },
  {
    id: "COMP-WIMBLEDON",
    sportId: "SPORT-TENNIS",
    name: "Wimbledon",
    region: "United Kingdom",
    status: "active",
    providerId: "provider-b",
    lastUpdated: "2026-09-28T07:50:00.000Z",
  },
  {
    id: "COMP-ASCOT",
    sportId: "SPORT-RACING",
    name: "Royal Ascot",
    region: "United Kingdom",
    status: "active",
    providerId: "provider-b",
    lastUpdated: "2026-09-28T08:08:00.000Z",
  },
  {
    id: "COMP-NBA",
    sportId: "SPORT-BASKETBALL",
    name: "NBA",
    region: "United States",
    status: "inactive",
    providerId: "provider-a",
    lastUpdated: "2026-06-01T04:00:00.000Z",
  },
  {
    id: "COMP-HOCKEY-WC",
    sportId: "SPORT-HOCKEY",
    name: "Hockey World Cup",
    region: "International",
    status: "suspended",
    providerId: "provider-b",
    lastUpdated: "2026-09-20T08:15:00.000Z",
  },
];

export const seedSportActivity: SportActivityRecord[] = [
  {
    id: "SACT-FOOTBALL-1",
    sportId: "SPORT-FOOTBALL",
    action: "SPORT_CONFIGURED",
    title: "Sport configured",
    at: "2025-08-01T04:00:00.000Z",
    source: null,
    reference: null,
  },
  {
    id: "SACT-FOOTBALL-2",
    sportId: "SPORT-FOOTBALL",
    action: "FEED_UPDATED",
    title: "Feed updated",
    at: "2026-09-28T08:10:00.000Z",
    source: "Feed A",
    reference: "provider-a",
  },
  {
    id: "SACT-CRICKET-1",
    sportId: "SPORT-CRICKET",
    action: "FEED_UPDATED",
    title: "Feed updated",
    at: "2026-09-28T08:12:00.000Z",
    source: "Feed A",
    reference: "provider-a",
  },
];
