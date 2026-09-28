export type AgentActivity = "trading" | "quiet";
export type AgentStatus = "active" | "suspended" | "pending" | "inactive";

export type AgentEvent = {
  id: string;
  title: string;
  detail: string;
  at: string;
};

export type AgentRecord = {
  id: string;
  name: string;
  contactName: string;
  username: string;
  email: string;
  phone: string;
  status: AgentStatus;
  users: number;
  activeUsers: number;
  balanceMinor: number;
  turnoverMinor: number;
  ggrMinor: number;
  commissionMinor: number;
  exposureMinor: number;
  heldMinor: number;
  monthTurnoverMinor: number;
  monthGgrMinor: number;
  shareBps: number;
  activity: AgentActivity;
  createdAt: string;
  events: AgentEvent[];
};

export const AGENT_AS_OF = "2026-09-28T08:15:00.000Z";

function rupees(amount: number): number {
  if (!Number.isInteger(amount)) throw new Error("Fixture amounts must be integer rupees.");
  return amount * 100;
}

type Seed = {
  id: string;
  name: string;
  contactName: string;
  username: string;
  phone: string;
  status: AgentStatus;
  users: number;
  activeUsers: number;
  balance: number;
  turnover: number;
  ggr: number;
  commission: number;
  exposure: number;
  held: number;
  monthTurnover: number;
  monthGgr: number;
  shareBps: number;
  activity: AgentActivity;
  createdAt: string;
};

function record(seed: Seed): AgentRecord {
  return {
    id: seed.id,
    name: seed.name,
    contactName: seed.contactName,
    username: seed.username,
    email: `${seed.username}@meridian.local`,
    phone: seed.phone,
    status: seed.status,
    users: seed.users,
    activeUsers: seed.activeUsers,
    balanceMinor: rupees(seed.balance),
    turnoverMinor: rupees(seed.turnover),
    ggrMinor: rupees(seed.ggr),
    commissionMinor: rupees(seed.commission),
    exposureMinor: rupees(seed.exposure),
    heldMinor: rupees(seed.held),
    monthTurnoverMinor: rupees(seed.monthTurnover),
    monthGgrMinor: rupees(seed.monthGgr),
    shareBps: seed.shareBps,
    activity: seed.activity,
    createdAt: seed.createdAt,
    events: [],
  };
}

export const seedAgents: readonly AgentRecord[] = [
  record({
    id: "AG-1042",
    name: "East Desk",
    contactName: "Rahul Sharma",
    username: "east.desk",
    phone: "+91 98000 01042",
    status: "active",
    users: 2140,
    activeUsers: 860,
    balance: 1840000,
    turnover: 986400,
    ggr: 142880,
    commission: 24660,
    exposure: 248500,
    held: 86000,
    monthTurnover: 4120000,
    monthGgr: 612000,
    shareBps: 250,
    activity: "trading",
    createdAt: "2025-11-04T04:30:00.000Z",
  }),
  record({
    id: "AG-1108",
    name: "North Desk",
    contactName: "Meera Iyer",
    username: "north.desk",
    phone: "+91 98000 01108",
    status: "active",
    users: 1866,
    activeUsers: 704,
    balance: 1265000,
    turnover: 864220,
    ggr: 121540,
    commission: 21605,
    exposure: 186400,
    held: 54000,
    monthTurnover: 3684000,
    monthGgr: 498200,
    shareBps: 250,
    activity: "trading",
    createdAt: "2026-01-18T06:10:00.000Z",
  }),
  record({
    id: "AG-0988",
    name: "West Desk",
    contactName: "Arjun Mehta",
    username: "west.desk",
    phone: "+91 98000 00988",
    status: "active",
    users: 1544,
    activeUsers: 512,
    balance: 980000,
    turnover: 742150,
    ggr: 98640,
    commission: 22264,
    exposure: 142800,
    held: 41000,
    monthTurnover: 3012500,
    monthGgr: 388400,
    shareBps: 300,
    activity: "trading",
    createdAt: "2026-03-02T05:00:00.000Z",
  }),
  record({
    id: "AG-1214",
    name: "South Desk",
    contactName: "Kavya Nair",
    username: "south.desk",
    phone: "+91 98000 01214",
    status: "active",
    users: 1298,
    activeUsers: 466,
    balance: 742000,
    turnover: 618900,
    ggr: 87420,
    commission: 15472,
    exposure: 96400,
    held: 28000,
    monthTurnover: 2548000,
    monthGgr: 341600,
    shareBps: 250,
    activity: "trading",
    createdAt: "2026-04-11T07:20:00.000Z",
  }),
  record({
    id: "AG-1302",
    name: "Central Desk",
    contactName: "Imran Qureshi",
    username: "central.desk",
    phone: "+91 98000 01302",
    status: "suspended",
    users: 640,
    activeUsers: 0,
    balance: 310000,
    turnover: 0,
    ggr: 0,
    commission: 0,
    exposure: 0,
    held: 310000,
    monthTurnover: 864000,
    monthGgr: 74200,
    shareBps: 200,
    activity: "quiet",
    createdAt: "2026-02-09T04:40:00.000Z",
  }),
  record({
    id: "AG-1416",
    name: "Harbour Desk",
    contactName: "Neha Kapoor",
    username: "harbour.desk",
    phone: "+91 98000 01416",
    status: "pending",
    users: 0,
    activeUsers: 0,
    balance: 0,
    turnover: 0,
    ggr: 0,
    commission: 0,
    exposure: 0,
    held: 0,
    monthTurnover: 0,
    monthGgr: 0,
    shareBps: 0,
    activity: "quiet",
    createdAt: "2026-09-20T09:15:00.000Z",
  }),
  record({
    id: "AG-0881",
    name: "Metro Desk",
    contactName: "Sanjay Rao",
    username: "metro.desk",
    phone: "+91 98000 00881",
    status: "inactive",
    users: 220,
    activeUsers: 0,
    balance: 125000,
    turnover: 0,
    ggr: 0,
    commission: 0,
    exposure: 0,
    held: 0,
    monthTurnover: 186000,
    monthGgr: 12400,
    shareBps: 200,
    activity: "quiet",
    createdAt: "2024-11-02T03:00:00.000Z",
  }),
  record({
    id: "AG-1520",
    name: "Ridge Desk",
    contactName: "Pooja Deshmukh",
    username: "ridge.desk",
    phone: "+91 98000 01520",
    status: "active",
    users: 488,
    activeUsers: 190,
    balance: 560000,
    turnover: 214600,
    ggr: 28640,
    commission: 5365,
    exposure: 42000,
    held: 12000,
    monthTurnover: 980000,
    monthGgr: 112400,
    shareBps: 250,
    activity: "trading",
    createdAt: "2026-06-14T08:00:00.000Z",
  }),
  record({
    id: "AG-0764",
    name: "Coast Desk",
    contactName: "Vikram Singh",
    username: "coast.desk",
    phone: "+91 98000 00764",
    status: "suspended",
    users: 96,
    activeUsers: 0,
    balance: 89000,
    turnover: 0,
    ggr: 0,
    commission: 0,
    exposure: 0,
    held: 89000,
    monthTurnover: 142000,
    monthGgr: 8600,
    shareBps: 150,
    activity: "quiet",
    createdAt: "2025-08-22T05:45:00.000Z",
  }),
  record({
    id: "AG-1608",
    name: "Hill Desk",
    contactName: "Ananya Reddy",
    username: "hill.desk",
    phone: "+91 98000 01608",
    status: "active",
    users: 372,
    activeUsers: 141,
    balance: 410000,
    turnover: 168400,
    ggr: 22110,
    commission: 5052,
    exposure: 28600,
    held: 9000,
    monthTurnover: 742000,
    monthGgr: 86400,
    shareBps: 300,
    activity: "trading",
    createdAt: "2026-09-02T06:30:00.000Z",
  }),
  record({
    id: "AG-0933",
    name: "Lake Desk",
    contactName: "Farhan Ali",
    username: "lake.desk",
    phone: "+91 98000 00933",
    status: "inactive",
    users: 54,
    activeUsers: 0,
    balance: 64000,
    turnover: 0,
    ggr: 0,
    commission: 0,
    exposure: 0,
    held: 0,
    monthTurnover: 48000,
    monthGgr: 2100,
    shareBps: 150,
    activity: "quiet",
    createdAt: "2025-01-19T04:15:00.000Z",
  }),
  record({
    id: "AG-1712",
    name: "Delta Desk",
    contactName: "Sneha Kulkarni",
    username: "delta.desk",
    phone: "+91 98000 01712",
    status: "pending",
    users: 0,
    activeUsers: 0,
    balance: 0,
    turnover: 0,
    ggr: 0,
    commission: 0,
    exposure: 0,
    held: 0,
    monthTurnover: 0,
    monthGgr: 0,
    shareBps: 0,
    activity: "quiet",
    createdAt: "2026-09-26T11:05:00.000Z",
  }),
  record({
    id: "AG-0640",
    name: "Fort Desk",
    contactName: "Rohan Joshi",
    username: "fort.desk",
    phone: "+91 98000 00640",
    status: "active",
    users: 128,
    activeUsers: 44,
    balance: 45000,
    turnover: 62400,
    ggr: 8120,
    commission: 1248,
    exposure: 9600,
    held: 2000,
    monthTurnover: 286000,
    monthGgr: 34100,
    shareBps: 200,
    activity: "trading",
    createdAt: "2026-07-28T09:40:00.000Z",
  }),
  record({
    id: "AG-1824",
    name: "Plaza Desk",
    contactName: "Divya Menon",
    username: "plaza.desk",
    phone: "+91 98000 01824",
    status: "active",
    users: 804,
    activeUsers: 266,
    balance: 890000,
    turnover: 306500,
    ggr: 42880,
    commission: 9195,
    exposure: 51200,
    held: 18000,
    monthTurnover: 1468000,
    monthGgr: 188400,
    shareBps: 300,
    activity: "trading",
    createdAt: "2026-05-16T02:50:00.000Z",
  }),
  record({
    id: "AG-0555",
    name: "Creek Desk",
    contactName: "Amit Banerjee",
    username: "creek.desk",
    phone: "+91 98000 00555",
    status: "active",
    users: 210,
    activeUsers: 18,
    balance: 210000,
    turnover: 18400,
    ggr: 1260,
    commission: 368,
    exposure: 4200,
    held: 1500,
    monthTurnover: 164000,
    monthGgr: 9800,
    shareBps: 200,
    activity: "quiet",
    createdAt: "2026-08-20T10:00:00.000Z",
  }),
  record({
    id: "AG-1908",
    name: "Park Desk",
    contactName: "Lata Krishnan",
    username: "park.desk",
    phone: "+91 98000 01908",
    status: "active",
    users: 556,
    activeUsers: 203,
    balance: 675000,
    turnover: 198750,
    ggr: 26440,
    commission: 4968,
    exposure: 33800,
    held: 11000,
    monthTurnover: 1124000,
    monthGgr: 136200,
    shareBps: 250,
    activity: "trading",
    createdAt: "2026-09-22T08:25:00.000Z",
  }),
];

export const performanceSeries: Record<string, readonly (readonly [string, number, number])[]> = {
  "AG-1042": [
    ["2026-09-22", 612400, 84210],
    ["2026-09-23", 548200, 76140],
    ["2026-09-24", 701500, 98440],
    ["2026-09-25", 664800, 91220],
    ["2026-09-26", 812600, 114080],
    ["2026-09-27", 794100, 105430],
    ["2026-09-28", 986400, 142880],
  ],
  "AG-1108": [
    ["2026-09-22", 540200, 74210],
    ["2026-09-23", 498600, 68140],
    ["2026-09-24", 612400, 86440],
    ["2026-09-25", 588100, 80120],
    ["2026-09-26", 704800, 96880],
    ["2026-09-27", 676200, 93210],
    ["2026-09-28", 864220, 121540],
  ],
  "AG-0988": [
    ["2026-09-22", 412600, 52110],
    ["2026-09-23", 388400, 48620],
    ["2026-09-24", 501200, 64280],
    ["2026-09-25", 476800, 59840],
    ["2026-09-26", 552100, 71440],
    ["2026-09-27", 568900, 73210],
    ["2026-09-28", 742150, 98640],
  ],
  "AG-1214": [
    ["2026-09-22", 348200, 46210],
    ["2026-09-23", 312600, 41880],
    ["2026-09-24", 401500, 54220],
    ["2026-09-25", 388400, 51640],
    ["2026-09-26", 452800, 60110],
    ["2026-09-27", 426500, 56940],
    ["2026-09-28", 618900, 87420],
  ],
};
