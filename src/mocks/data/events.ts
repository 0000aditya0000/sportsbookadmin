export type EventStatus = "scheduled" | "live" | "completed" | "suspended" | "cancelled" | "postponed";
export type ParticipantRole = "home" | "away" | "participant";

export type ParticipantRecord = {
  id: string;
  name: string;
  shortName: string;
  role: ParticipantRole;
};

export type EventRecord = {
  id: string;
  sportId: string;
  competitionId: string;
  name: string;
  status: EventStatus;
  startTime: string;
  lastUpdated: string;
  providerId: string;
  providerEventId: string;
  providerStatus: "current" | "delayed";
  participants: ParticipantRecord[];
};

export type EventActivityRecord = {
  id: string;
  eventId: string;
  action: string;
  title: string;
  at: string;
  source: string | null;
  reference: string | null;
};

function sides(home: string, homeShort: string, away: string, awayShort: string): ParticipantRecord[] {
  return [
    { id: `P-${homeShort}`, name: home, shortName: homeShort, role: "home" },
    { id: `P-${awayShort}`, name: away, shortName: awayShort, role: "away" },
  ];
}

export const seedEvents: EventRecord[] = [
  {
    id: "EVT-IND-AUS",
    sportId: "SPORT-CRICKET",
    competitionId: "COMP-INTL",
    name: "India vs Australia",
    status: "live",
    startTime: "2026-09-28T08:03:00.000Z",
    lastUpdated: "2026-09-28T08:14:00.000Z",
    providerId: "provider-a",
    providerEventId: "PA-IND-AUS",
    providerStatus: "current",
    participants: sides("India", "IND", "Australia", "AUS"),
  },
  {
    id: "EVT-MI-CSK",
    sportId: "SPORT-CRICKET",
    competitionId: "COMP-IPL",
    name: "Mumbai Indians vs Chennai Super Kings",
    status: "live",
    startTime: "2026-09-28T07:40:00.000Z",
    lastUpdated: "2026-09-28T08:11:00.000Z",
    providerId: "provider-a",
    providerEventId: "PA-MI-CSK",
    providerStatus: "current",
    participants: sides("Mumbai Indians", "MI", "Chennai Super Kings", "CSK"),
  },
  {
    id: "EVT-10021",
    sportId: "SPORT-FOOTBALL",
    competitionId: "COMP-EPL",
    name: "Manchester United vs Arsenal",
    status: "scheduled",
    startTime: "2026-09-28T14:00:00.000Z",
    lastUpdated: "2026-09-28T08:02:00.000Z",
    providerId: "provider-a",
    providerEventId: "PA-10021",
    providerStatus: "current",
    participants: sides("Manchester United", "MUN", "Arsenal", "ARS"),
  },
  {
    id: "EVT-10022",
    sportId: "SPORT-FOOTBALL",
    competitionId: "COMP-LALIGA",
    name: "Real Madrid vs Barcelona",
    status: "scheduled",
    startTime: "2026-09-29T19:00:00.000Z",
    lastUpdated: "2026-09-28T07:20:00.000Z",
    providerId: "provider-b",
    providerEventId: "PB-10022",
    providerStatus: "current",
    participants: sides("Real Madrid", "RMA", "Barcelona", "BAR"),
  },
  {
    id: "EVT-10023",
    sportId: "SPORT-FOOTBALL",
    competitionId: "COMP-EPL",
    name: "Liverpool vs Chelsea",
    status: "completed",
    startTime: "2026-09-27T14:00:00.000Z",
    lastUpdated: "2026-09-27T16:10:00.000Z",
    providerId: "provider-a",
    providerEventId: "PA-10023",
    providerStatus: "current",
    participants: sides("Liverpool", "LIV", "Chelsea", "CHE"),
  },
  {
    id: "EVT-10024",
    sportId: "SPORT-FOOTBALL",
    competitionId: "COMP-EPL",
    name: "Tottenham vs Newcastle",
    status: "suspended",
    startTime: "2026-09-28T16:30:00.000Z",
    lastUpdated: "2026-09-28T08:06:00.000Z",
    providerId: "provider-a",
    providerEventId: "PA-10024",
    providerStatus: "delayed",
    participants: sides("Tottenham", "TOT", "Newcastle", "NEW"),
  },
  {
    id: "EVT-10025",
    sportId: "SPORT-FOOTBALL",
    competitionId: "COMP-EPL",
    name: "Everton vs Brighton",
    status: "cancelled",
    startTime: "2026-09-28T11:00:00.000Z",
    lastUpdated: "2026-09-28T06:00:00.000Z",
    providerId: "provider-b",
    providerEventId: "PB-10025",
    providerStatus: "current",
    participants: sides("Everton", "EVE", "Brighton", "BHA"),
  },
  {
    id: "EVT-10026",
    sportId: "SPORT-FOOTBALL",
    competitionId: "COMP-EPL",
    name: "Aston Villa vs Wolves",
    status: "postponed",
    startTime: "2026-09-30T14:00:00.000Z",
    lastUpdated: "2026-09-28T05:30:00.000Z",
    providerId: "provider-a",
    providerEventId: "PA-10026",
    providerStatus: "current",
    participants: sides("Aston Villa", "AVL", "Wolves", "WOL"),
  },
  {
    id: "EVT-10027",
    sportId: "SPORT-FOOTBALL",
    competitionId: "COMP-EPL",
    name: "Manchester City vs Fulham",
    status: "scheduled",
    startTime: "2026-10-04T14:00:00.000Z",
    lastUpdated: "2026-09-28T04:00:00.000Z",
    providerId: "provider-a",
    providerEventId: "PA-10027",
    providerStatus: "current",
    participants: sides("Manchester City", "MCI", "Fulham", "FUL"),
  },
  {
    id: "EVT-20011",
    sportId: "SPORT-TENNIS",
    competitionId: "COMP-WIMBLEDON",
    name: "Carlos Alcaraz vs Jannik Sinner",
    status: "scheduled",
    startTime: "2026-09-28T12:00:00.000Z",
    lastUpdated: "2026-09-28T07:50:00.000Z",
    providerId: "provider-b",
    providerEventId: "PB-20011",
    providerStatus: "current",
    participants: [
      { id: "P-ALCARAZ", name: "Carlos Alcaraz", shortName: "Alcaraz", role: "participant" },
      { id: "P-SINNER", name: "Jannik Sinner", shortName: "Sinner", role: "participant" },
    ],
  },
  {
    id: "EVT-20012",
    sportId: "SPORT-TENNIS",
    competitionId: "COMP-WIMBLEDON",
    name: "Novak Djokovic vs Daniil Medvedev",
    status: "completed",
    startTime: "2026-09-26T11:00:00.000Z",
    lastUpdated: "2026-09-26T13:40:00.000Z",
    providerId: "provider-b",
    providerEventId: "PB-20012",
    providerStatus: "current",
    participants: [
      { id: "P-DJOKOVIC", name: "Novak Djokovic", shortName: "Djokovic", role: "participant" },
      { id: "P-MEDVEDEV", name: "Daniil Medvedev", shortName: "Medvedev", role: "participant" },
    ],
  },
  {
    id: "EVT-20013",
    sportId: "SPORT-TENNIS",
    competitionId: "COMP-WIMBLEDON",
    name: "Iga Swiatek vs Coco Gauff",
    status: "scheduled",
    startTime: "2026-09-28T15:30:00.000Z",
    lastUpdated: "2026-09-28T07:10:00.000Z",
    providerId: "provider-b",
    providerEventId: "PB-20013",
    providerStatus: "current",
    participants: [
      { id: "P-SWIATEK", name: "Iga Swiatek", shortName: "Swiatek", role: "participant" },
      { id: "P-GAUFF", name: "Coco Gauff", shortName: "Gauff", role: "participant" },
    ],
  },
  {
    id: "EVT-30001",
    sportId: "SPORT-RACING",
    competitionId: "COMP-ASCOT",
    name: "Ascot 15:40",
    status: "scheduled",
    startTime: "2026-09-28T10:10:00.000Z",
    lastUpdated: "2026-09-28T08:00:00.000Z",
    providerId: "provider-b",
    providerEventId: "PB-30001",
    providerStatus: "current",
    participants: [
      { id: "RUN-1", name: "Northern Light", shortName: "N. Light", role: "participant" },
      { id: "RUN-2", name: "Harbour Mist", shortName: "H. Mist", role: "participant" },
      { id: "RUN-3", name: "Royal Measure", shortName: "R. Measure", role: "participant" },
      { id: "RUN-4", name: "East Wind", shortName: "E. Wind", role: "participant" },
    ],
  },
  {
    id: "EVT-30002",
    sportId: "SPORT-RACING",
    competitionId: "COMP-ASCOT",
    name: "Ascot 16:15",
    status: "live",
    startTime: "2026-09-28T08:05:00.000Z",
    lastUpdated: "2026-09-28T08:13:00.000Z",
    providerId: "provider-b",
    providerEventId: "PB-30002",
    providerStatus: "current",
    participants: [
      { id: "RUN-5", name: "Silver Archive", shortName: "S. Archive", role: "participant" },
      { id: "RUN-6", name: "Paper Crown", shortName: "P. Crown", role: "participant" },
      { id: "RUN-7", name: "Quiet Harbour", shortName: "Q. Harbour", role: "participant" },
    ],
  },
  {
    id: "EVT-40001",
    sportId: "SPORT-BASKETBALL",
    competitionId: "COMP-NBA",
    name: "Lakers vs Celtics",
    status: "scheduled",
    startTime: "2026-10-02T00:30:00.000Z",
    lastUpdated: "2026-06-01T04:00:00.000Z",
    providerId: "provider-a",
    providerEventId: "PA-40001",
    providerStatus: "delayed",
    participants: sides("Lakers", "LAL", "Celtics", "BOS"),
  },
  {
    id: "EVT-50001",
    sportId: "SPORT-HOCKEY",
    competitionId: "COMP-HOCKEY-WC",
    name: "India vs Belgium",
    status: "suspended",
    startTime: "2026-09-28T09:00:00.000Z",
    lastUpdated: "2026-09-20T08:15:00.000Z",
    providerId: "provider-b",
    providerEventId: "PB-50001",
    providerStatus: "delayed",
    participants: sides("India", "IND-H", "Belgium", "BEL"),
  },
];

export const seedEventActivity: EventActivityRecord[] = [
  {
    id: "EACT-IND-1",
    eventId: "EVT-IND-AUS",
    action: "EVENT_CREATED",
    title: "Event opened",
    at: "2026-09-20T04:00:00.000Z",
    source: null,
    reference: null,
  },
  {
    id: "EACT-IND-2",
    eventId: "EVT-IND-AUS",
    action: "EVENT_STARTED",
    title: "Event started",
    at: "2026-09-28T08:03:00.000Z",
    source: "Feed A",
    reference: "PA-IND-AUS",
  },
  {
    id: "EACT-IND-3",
    eventId: "EVT-IND-AUS",
    action: "EVENT_PROVIDER_UPDATED",
    title: "Provider update",
    at: "2026-09-28T08:14:00.000Z",
    source: "Feed A",
    reference: "PA-IND-AUS",
  },
  {
    id: "EACT-10021-1",
    eventId: "EVT-10021",
    action: "EVENT_CREATED",
    title: "Event opened",
    at: "2026-09-18T04:00:00.000Z",
    source: null,
    reference: "PA-10021",
  },
  {
    id: "EACT-10024-1",
    eventId: "EVT-10024",
    action: "EVENT_SUSPENDED",
    title: "Event suspended",
    at: "2026-09-28T08:06:00.000Z",
    source: "Feed A",
    reference: "PA-10024",
  },
];
