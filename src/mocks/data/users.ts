export const USER_AS_OF = "2026-09-28T08:15:00.000Z";

export type UserStatus = "active" | "suspended" | "banned" | "locked";
export type ResumeStatus = "active" | "suspended";

export type UserRecord = {
  id: string;
  displayName: string;
  username: string;
  email: string;
  phone: string;
  agentId: string;
  agentName: string;
  status: UserStatus;
  resumeStatus: ResumeStatus | null;
  balanceMinor: number;
  heldMinor: number;
  openBets: number;
  totalBets: number;
  turnoverMinor: number;
  ggrMinor: number;
  lastLoginAt: string | null;
  createdAt: string;
  hasActiveSession: boolean;
};

export type UserSessionRecord = {
  id: string;
  userId: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  loginAt: string;
  lastActiveAt: string;
  expiresAt: string;
  status: "active" | "revoked" | "expired";
};

export type UserBetRecord = {
  id: string;
  userId: string;
  event: string;
  market: string;
  selection: string;
  stakeMinor: number;
  odds: string;
  potentialPayoutMinor: number;
  status: "open" | "settled" | "rejected" | "cancelled";
  settlement: "unsettled" | "won" | "lost" | "void" | "rejected" | "cancelled";
  placedAt: string;
};

export type UserTransactionRecord = {
  id: string;
  userId: string;
  type: string;
  direction: "credit" | "debit";
  amountMinor: number;
  status: "posted" | "pending" | "failed";
  reference: string;
  createdAt: string;
};

export type UserActivityRecord = {
  id: string;
  userId: string;
  action: string;
  title: string;
  at: string;
  actor: string | null;
  reference: string | null;
};

export type UserRiskRecord = {
  userId: string;
  exposureMinor: number;
  openBets: number;
  largeBetIds: string[];
  flags: string[];
  maxStakeMinor: number;
};

function rupees(value: number): number {
  if (!Number.isInteger(value)) throw new Error("User money must be whole rupees.");
  return value * 100;
}

const desks = [
  { id: "AG-1042", name: "East Desk" },
  { id: "AG-1108", name: "North Desk" },
  { id: "AG-0988", name: "West Desk" },
  { id: "AG-1214", name: "South Desk" },
  { id: "AG-1302", name: "Central Desk" },
  { id: "AG-1416", name: "Harbour Desk" },
  { id: "AG-0881", name: "Metro Desk" },
  { id: "AG-1520", name: "Ridge Desk" },
  { id: "AG-0764", name: "Coast Desk" },
  { id: "AG-1608", name: "Hill Desk" },
  { id: "AG-0933", name: "Lake Desk" },
  { id: "AG-1712", name: "Delta Desk" },
  { id: "AG-0640", name: "Fort Desk" },
  { id: "AG-1824", name: "Plaza Desk" },
  { id: "AG-0555", name: "Creek Desk" },
  { id: "AG-1908", name: "Park Desk" },
] as const;

function namedUser(input: {
  id: string;
  displayName: string;
  username: string;
  email: string;
  phone: string;
  agentId: string;
  agentName: string;
  status: UserStatus;
  resumeStatus?: ResumeStatus | null;
  balance: number;
  held?: number;
  openBets: number;
  totalBets: number;
  turnover: number;
  ggr: number;
  lastLoginAt: string | null;
  createdAt: string;
  hasActiveSession: boolean;
}): UserRecord {
  return {
    id: input.id,
    displayName: input.displayName,
    username: input.username,
    email: input.email,
    phone: input.phone,
    agentId: input.agentId,
    agentName: input.agentName,
    status: input.status,
    resumeStatus: input.resumeStatus ?? null,
    balanceMinor: rupees(input.balance),
    heldMinor: rupees(input.held ?? 0),
    openBets: input.openBets,
    totalBets: input.totalBets,
    turnoverMinor: rupees(input.turnover),
    ggrMinor: rupees(input.ggr),
    lastLoginAt: input.lastLoginAt,
    createdAt: input.createdAt,
    hasActiveSession: input.hasActiveSession,
  };
}

const namedUsers: UserRecord[] = [
  namedUser({
    id: "27411",
    displayName: "Aditya Sharma",
    username: "aditya.sharma",
    email: "aditya.sharma@meridian.local",
    phone: "+91 98000 27411",
    agentId: "AG-1042",
    agentName: "East Desk",
    status: "active",
    balance: 12450,
    held: 860,
    openBets: 3,
    totalBets: 7,
    turnover: 86400,
    ggr: 4280,
    lastLoginAt: "2026-09-28T07:40:00.000Z",
    createdAt: "2025-06-12T04:20:00.000Z",
    hasActiveSession: true,
  }),
  namedUser({
    id: "33108",
    displayName: "Sana Qureshi",
    username: "sana.qureshi",
    email: "sana.qureshi@meridian.local",
    phone: "+91 98000 33108",
    agentId: "AG-1042",
    agentName: "East Desk",
    status: "active",
    balance: 25600,
    held: 0,
    openBets: 4,
    totalBets: 4,
    turnover: 41200,
    ggr: 1860,
    lastLoginAt: "2026-09-28T05:02:00.000Z",
    createdAt: "2026-01-18T09:00:00.000Z",
    hasActiveSession: true,
  }),
  namedUser({
    id: "19022",
    displayName: "Kabir Menon",
    username: "kabir.menon",
    email: "kabir.menon@meridian.local",
    phone: "+91 98000 19022",
    agentId: "AG-1108",
    agentName: "North Desk",
    status: "active",
    balance: 8400,
    held: 200,
    openBets: 1,
    totalBets: 1,
    turnover: 22100,
    ggr: 640,
    lastLoginAt: "2026-09-28T06:12:00.000Z",
    createdAt: "2026-03-02T11:30:00.000Z",
    hasActiveSession: true,
  }),
  namedUser({
    id: "22814",
    displayName: "Rohan Desai",
    username: "rohan.desai",
    email: "rohan.desai@meridian.local",
    phone: "+91 98000 22814",
    agentId: "AG-0988",
    agentName: "West Desk",
    status: "suspended",
    balance: 1200,
    openBets: 0,
    totalBets: 1,
    turnover: 9800,
    ggr: -220,
    lastLoginAt: "2026-09-21T11:18:00.000Z",
    createdAt: "2026-09-22T08:00:00.000Z",
    hasActiveSession: false,
  }),
  namedUser({
    id: "44190",
    displayName: "Anika Rao",
    username: "anika.rao",
    email: "anika.rao@meridian.local",
    phone: "+91 98000 44190",
    agentId: "AG-1214",
    agentName: "South Desk",
    status: "locked",
    resumeStatus: "suspended",
    balance: 0,
    openBets: 0,
    totalBets: 0,
    turnover: 1500,
    ggr: 0,
    lastLoginAt: null,
    createdAt: "2026-08-01T06:00:00.000Z",
    hasActiveSession: false,
  }),
  namedUser({
    id: "55201",
    displayName: "Dev Nair",
    username: "dev.nair",
    email: "dev.nair@meridian.local",
    phone: "+91 98000 55201",
    agentId: "AG-1302",
    agentName: "Central Desk",
    status: "banned",
    balance: 300,
    openBets: 0,
    totalBets: 0,
    turnover: 500,
    ggr: 40,
    lastLoginAt: "2026-07-02T04:00:00.000Z",
    createdAt: "2026-02-11T04:00:00.000Z",
    hasActiveSession: false,
  }),
  namedUser({
    id: "61002",
    displayName: "Meera Iyer",
    username: "meera.iyer",
    email: "meera.iyer@meridian.local",
    phone: "+91 98000 61002",
    agentId: "AG-1520",
    agentName: "Ridge Desk",
    status: "active",
    balance: 4500,
    openBets: 0,
    totalBets: 0,
    turnover: 0,
    ggr: 0,
    lastLoginAt: "2026-08-30T10:00:00.000Z",
    createdAt: "2026-09-25T09:12:00.000Z",
    hasActiveSession: false,
  }),
  namedUser({
    id: "61003",
    displayName: "Arjun Sethi",
    username: "arjun.sethi",
    email: "arjun.sethi@meridian.local",
    phone: "+91 98000 61003",
    agentId: "AG-1042",
    agentName: "East Desk",
    status: "active",
    balance: 250000,
    held: 12000,
    openBets: 2,
    totalBets: 2,
    turnover: 640000,
    ggr: 22000,
    lastLoginAt: "2026-09-28T08:02:00.000Z",
    createdAt: "2024-11-03T02:00:00.000Z",
    hasActiveSession: true,
  }),
];

const statusCycle: UserStatus[] = ["active", "active", "active", "suspended", "banned", "locked"];

function generatedUsers(): UserRecord[] {
  return Array.from({ length: 24 }, (_, index) => {
    const desk = desks[index % desks.length]!;
    const id = String(42000 + index);
    const status = statusCycle[index % statusCycle.length]!;
    const createdAt = new Date(Date.parse(USER_AS_OF) - (index + 3) * 86_400_000).toISOString();
    const hasActiveSession = status === "active" && index % 3 === 0;
    return namedUser({
      id,
      displayName: `User ${id}`,
      username: `user.${id}`,
      email: `user.${id}@meridian.local`,
      phone: `+91 98000 ${id}`,
      agentId: desk.id,
      agentName: desk.name,
      status,
      resumeStatus: status === "locked" ? (index % 2 === 0 ? "active" : "suspended") : null,
      balance: 500 + index * 750,
      held: index % 5 === 0 ? 100 : 0,
      openBets: 0,
      totalBets: 0,
      turnover: 1000 * (index + 1),
      ggr: index % 4 === 0 ? 0 : 80 * (index + 1),
      lastLoginAt: hasActiveSession ? "2026-09-28T07:00:00.000Z" : index % 2 === 0 ? "2026-09-20T07:00:00.000Z" : null,
      createdAt,
      hasActiveSession,
    });
  });
}

export function buildSeedUsers(): UserRecord[] {
  return [...namedUsers, ...generatedUsers()];
}

export const seedSessions: UserSessionRecord[] = [
  {
    id: "SES-27411",
    userId: "27411",
    device: "Windows PC",
    browser: "Chrome 129",
    os: "Windows 11",
    ip: "103.25.12.40",
    loginAt: "2026-09-28T07:40:00.000Z",
    lastActiveAt: "2026-09-28T08:10:00.000Z",
    expiresAt: "2026-09-28T15:40:00.000Z",
    status: "active",
  },
  {
    id: "SES-27411-PREV",
    userId: "27411",
    device: "Pixel 8",
    browser: "Chrome 128",
    os: "Android 14",
    ip: "49.36.8.12",
    loginAt: "2026-09-26T04:12:00.000Z",
    lastActiveAt: "2026-09-26T09:40:00.000Z",
    expiresAt: "2026-09-26T12:12:00.000Z",
    status: "expired",
  },
  {
    id: "SES-33108",
    userId: "33108",
    device: "MacBook",
    browser: "Safari 18",
    os: "macOS 15",
    ip: "103.25.18.9",
    loginAt: "2026-09-28T05:02:00.000Z",
    lastActiveAt: "2026-09-28T07:55:00.000Z",
    expiresAt: "2026-09-28T13:02:00.000Z",
    status: "active",
  },
  {
    id: "SES-19022",
    userId: "19022",
    device: "iPhone 15",
    browser: "Safari 18",
    os: "iOS 18",
    ip: "49.36.22.4",
    loginAt: "2026-09-28T06:12:00.000Z",
    lastActiveAt: "2026-09-28T07:48:00.000Z",
    expiresAt: "2026-09-28T14:12:00.000Z",
    status: "active",
  },
  {
    id: "SES-22814",
    userId: "22814",
    device: "Windows PC",
    browser: "Edge 129",
    os: "Windows 11",
    ip: "103.25.40.2",
    loginAt: "2026-09-21T11:18:00.000Z",
    lastActiveAt: "2026-09-21T12:00:00.000Z",
    expiresAt: "2026-09-21T19:18:00.000Z",
    status: "expired",
  },
  {
    id: "SES-44190",
    userId: "44190",
    device: "Android phone",
    browser: "Chrome 127",
    os: "Android 14",
    ip: "49.36.70.15",
    loginAt: "2026-08-12T03:00:00.000Z",
    lastActiveAt: "2026-08-12T03:20:00.000Z",
    expiresAt: "2026-08-12T11:00:00.000Z",
    status: "expired",
  },
  {
    id: "SES-55201",
    userId: "55201",
    device: "Windows PC",
    browser: "Chrome 126",
    os: "Windows 10",
    ip: "103.25.90.6",
    loginAt: "2026-07-02T04:00:00.000Z",
    lastActiveAt: "2026-07-02T04:10:00.000Z",
    expiresAt: "2026-07-02T12:00:00.000Z",
    status: "revoked",
  },
  {
    id: "SES-61003",
    userId: "61003",
    device: "Windows PC",
    browser: "Chrome 129",
    os: "Windows 11",
    ip: "103.25.12.88",
    loginAt: "2026-09-28T08:02:00.000Z",
    lastActiveAt: "2026-09-28T08:12:00.000Z",
    expiresAt: "2026-09-28T16:02:00.000Z",
    status: "active",
  },
];

function generatedSessions(users: readonly UserRecord[]): UserSessionRecord[] {
  return users
    .filter((user) => user.hasActiveSession && !seedSessions.some((session) => session.userId === user.id))
    .map((user) => ({
      id: `SES-${user.id}`,
      userId: user.id,
      device: "Windows PC",
      browser: "Chrome 129",
      os: "Windows 11",
      ip: "103.25.12.40",
      loginAt: "2026-09-28T07:00:00.000Z",
      lastActiveAt: "2026-09-28T08:00:00.000Z",
      expiresAt: "2026-09-28T15:00:00.000Z",
      status: "active" as const,
    }));
}

export function buildSeedSessions(users: readonly UserRecord[]): UserSessionRecord[] {
  return [...seedSessions, ...generatedSessions(users)];
}

export const seedBets: UserBetRecord[] = [
  {
    id: "BET-88421",
    userId: "27411",
    event: "MI vs CSK",
    market: "Match Odds",
    selection: "Mumbai Indians",
    stakeMinor: rupees(2500),
    odds: "1.91",
    potentialPayoutMinor: rupees(4775),
    status: "open",
    settlement: "unsettled",
    placedAt: "2026-09-28T07:42:11.000Z",
  },
  {
    id: "BET-88402",
    userId: "27411",
    event: "Arsenal vs Chelsea",
    market: "Over 2.5",
    selection: "Over",
    stakeMinor: rupees(800),
    odds: "1.72",
    potentialPayoutMinor: rupees(1376),
    status: "open",
    settlement: "unsettled",
    placedAt: "2026-09-28T07:36:04.000Z",
  },
  {
    id: "BET-88371",
    userId: "27411",
    event: "IND vs AUS",
    market: "Session 24",
    selection: "Yes",
    stakeMinor: rupees(1500),
    odds: "1.85",
    potentialPayoutMinor: rupees(2775),
    status: "open",
    settlement: "unsettled",
    placedAt: "2026-09-28T07:21:18.000Z",
  },
  {
    id: "BET-87010",
    userId: "27411",
    event: "KKR vs RR",
    market: "Match Odds",
    selection: "Kolkata",
    stakeMinor: rupees(1000),
    odds: "2.10",
    potentialPayoutMinor: rupees(2100),
    status: "settled",
    settlement: "won",
    placedAt: "2026-09-20T14:02:00.000Z",
  },
  {
    id: "BET-86900",
    userId: "27411",
    event: "Lakers vs Celtics",
    market: "Moneyline",
    selection: "Celtics",
    stakeMinor: rupees(600),
    odds: "1.66",
    potentialPayoutMinor: rupees(996),
    status: "settled",
    settlement: "lost",
    placedAt: "2026-09-18T18:11:00.000Z",
  },
  {
    id: "BET-86110",
    userId: "27411",
    event: "MI vs CSK",
    market: "Match Odds",
    selection: "Chennai",
    stakeMinor: rupees(400),
    odds: "1.95",
    potentialPayoutMinor: rupees(0),
    status: "rejected",
    settlement: "rejected",
    placedAt: "2026-09-17T06:40:00.000Z",
  },
  {
    id: "BET-86002",
    userId: "27411",
    event: "IND vs AUS",
    market: "Toss",
    selection: "India",
    stakeMinor: rupees(200),
    odds: "1.90",
    potentialPayoutMinor: rupees(0),
    status: "cancelled",
    settlement: "cancelled",
    placedAt: "2026-09-16T05:15:00.000Z",
  },
  {
    id: "BET-19022",
    userId: "19022",
    event: "MI vs CSK",
    market: "Match Odds",
    selection: "Chennai",
    stakeMinor: rupees(500),
    odds: "1.95",
    potentialPayoutMinor: rupees(975),
    status: "open",
    settlement: "unsettled",
    placedAt: "2026-09-28T06:20:00.000Z",
  },
  {
    id: "BET-33108-1",
    userId: "33108",
    event: "IND vs AUS",
    market: "Match Odds",
    selection: "India",
    stakeMinor: rupees(1200),
    odds: "1.74",
    potentialPayoutMinor: rupees(2088),
    status: "open",
    settlement: "unsettled",
    placedAt: "2026-09-28T05:10:00.000Z",
  },
  {
    id: "BET-33108-2",
    userId: "33108",
    event: "MI vs CSK",
    market: "Session 18",
    selection: "No",
    stakeMinor: rupees(700),
    odds: "1.88",
    potentialPayoutMinor: rupees(1316),
    status: "open",
    settlement: "unsettled",
    placedAt: "2026-09-28T05:14:00.000Z",
  },
  {
    id: "BET-33108-3",
    userId: "33108",
    event: "Arsenal vs Chelsea",
    market: "Match Odds",
    selection: "Arsenal",
    stakeMinor: rupees(900),
    odds: "2.05",
    potentialPayoutMinor: rupees(1845),
    status: "open",
    settlement: "unsettled",
    placedAt: "2026-09-28T05:18:00.000Z",
  },
  {
    id: "BET-33108-4",
    userId: "33108",
    event: "KKR vs RR",
    market: "Match Odds",
    selection: "Rajasthan",
    stakeMinor: rupees(450),
    odds: "1.80",
    potentialPayoutMinor: rupees(810),
    status: "open",
    settlement: "unsettled",
    placedAt: "2026-09-28T05:22:00.000Z",
  },
  {
    id: "BET-61003-1",
    userId: "61003",
    event: "IND vs AUS",
    market: "Match Odds",
    selection: "Australia",
    stakeMinor: rupees(20000),
    odds: "2.40",
    potentialPayoutMinor: rupees(48000),
    status: "open",
    settlement: "unsettled",
    placedAt: "2026-09-28T08:04:00.000Z",
  },
  {
    id: "BET-61003-2",
    userId: "61003",
    event: "Real Madrid vs Barcelona",
    market: "Match Odds",
    selection: "Draw",
    stakeMinor: rupees(15000),
    odds: "3.20",
    potentialPayoutMinor: rupees(48000),
    status: "open",
    settlement: "unsettled",
    placedAt: "2026-09-28T08:06:00.000Z",
  },
  {
    id: "BET-22814",
    userId: "22814",
    event: "KKR vs RR",
    market: "Match Odds",
    selection: "Kolkata",
    stakeMinor: rupees(300),
    odds: "1.70",
    potentialPayoutMinor: rupees(510),
    status: "settled",
    settlement: "lost",
    placedAt: "2026-09-21T11:00:00.000Z",
  },
];

export const seedTransactions: UserTransactionRecord[] = [
  {
    id: "TXN-88101",
    userId: "27411",
    type: "Deposit",
    direction: "credit",
    amountMinor: rupees(5000),
    status: "posted",
    reference: "DEP-4410",
    createdAt: "2026-09-27T09:12:00.000Z",
  },
  {
    id: "TXN-88140",
    userId: "27411",
    type: "Bet stake",
    direction: "debit",
    amountMinor: rupees(2500),
    status: "posted",
    reference: "BET-88421",
    createdAt: "2026-09-28T07:42:11.000Z",
  },
  {
    id: "TXN-88155",
    userId: "27411",
    type: "Hold",
    direction: "debit",
    amountMinor: rupees(860),
    status: "pending",
    reference: "HOLD-27411",
    createdAt: "2026-09-28T07:42:12.000Z",
  },
  {
    id: "TXN-19001",
    userId: "19022",
    type: "Deposit",
    direction: "credit",
    amountMinor: rupees(2000),
    status: "posted",
    reference: "DEP-19022",
    createdAt: "2026-09-26T08:00:00.000Z",
  },
];

export const seedActivity: UserActivityRecord[] = [
  {
    id: "ACT-27411-1",
    userId: "27411",
    action: "USER_CREATED",
    title: "Account opened",
    at: "2025-06-12T04:20:00.000Z",
    actor: null,
    reference: null,
  },
  {
    id: "ACT-27411-2",
    userId: "27411",
    action: "USER_LOGIN",
    title: "Signed in",
    at: "2026-09-28T07:40:00.000Z",
    actor: null,
    reference: "SES-27411",
  },
  {
    id: "ACT-27411-3",
    userId: "27411",
    action: "BET_PLACED",
    title: "Bet placed",
    at: "2026-09-28T07:42:11.000Z",
    actor: null,
    reference: "BET-88421",
  },
  {
    id: "ACT-27411-4",
    userId: "27411",
    action: "WALLET_ACTIVITY",
    title: "Wallet hold posted",
    at: "2026-09-28T07:42:12.000Z",
    actor: null,
    reference: "TXN-88155",
  },
  {
    id: "ACT-27411-5",
    userId: "27411",
    action: "BET_SETTLED",
    title: "Bet settled",
    at: "2026-09-20T18:00:00.000Z",
    actor: null,
    reference: "BET-87010",
  },
];

export const seedRisk: UserRiskRecord[] = [
  {
    userId: "27411",
    exposureMinor: rupees(4775),
    openBets: 3,
    largeBetIds: ["BET-88421"],
    flags: ["LARGE_STAKE"],
    maxStakeMinor: rupees(25000),
  },
];
