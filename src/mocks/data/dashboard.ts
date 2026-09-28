export const DASHBOARD_GENERATED_AT = "2026-09-28T08:15:00.000Z";

export const turnoverSeries = [
  { date: "2026-09-15", turnoverRupees: 2215400, ggrRupees: 301220, depositsRupees: 920000, withdrawalsRupees: 610000, bets: 4120 },
  { date: "2026-09-16", turnoverRupees: 1988700, ggrRupees: 274540, depositsRupees: 804000, withdrawalsRupees: 552000, bets: 3890 },
  { date: "2026-09-17", turnoverRupees: 2456100, ggrRupees: 352180, depositsRupees: 1012000, withdrawalsRupees: 688000, bets: 4510 },
  { date: "2026-09-18", turnoverRupees: 3120400, ggrRupees: 441900, depositsRupees: 1248000, withdrawalsRupees: 842000, bets: 5204 },
  { date: "2026-09-19", turnoverRupees: 4682200, ggrRupees: 655080, depositsRupees: 1690000, withdrawalsRupees: 1104000, bets: 7012 },
  { date: "2026-09-20", turnoverRupees: 5218400, ggrRupees: 734260, depositsRupees: 1925000, withdrawalsRupees: 1288000, bets: 7840 },
  { date: "2026-09-21", turnoverRupees: 3894500, ggrRupees: 512340, depositsRupees: 1410000, withdrawalsRupees: 966000, bets: 6102 },
  { date: "2026-09-22", turnoverRupees: 2766800, ggrRupees: 361150, depositsRupees: 990000, withdrawalsRupees: 704000, bets: 4550 },
  { date: "2026-09-23", turnoverRupees: 2543900, ggrRupees: 338720, depositsRupees: 876000, withdrawalsRupees: 640000, bets: 4320 },
  { date: "2026-09-24", turnoverRupees: 3012750, ggrRupees: 419640, depositsRupees: 1184000, withdrawalsRupees: 798000, bets: 4988 },
  { date: "2026-09-25", turnoverRupees: 3568400, ggrRupees: 498210, depositsRupees: 1366000, withdrawalsRupees: 912000, bets: 5610 },
  { date: "2026-09-26", turnoverRupees: 4921500, ggrRupees: 701540, depositsRupees: 1768000, withdrawalsRupees: 1202000, bets: 6904 },
  { date: "2026-09-27", turnoverRupees: 5389200, ggrRupees: 764880, depositsRupees: 2014000, withdrawalsRupees: 1346000, bets: 7420 },
  { date: "2026-09-28", turnoverRupees: 4852300, ggrRupees: 682410, depositsRupees: 1840000, withdrawalsRupees: 1125500, bets: 6521 },
] as const;

export const sportMix = [
  { sport: "Cricket", turnoverRupees: 2241763, shareBps: 4620 },
  { sport: "Football", turnoverRupees: 1086915, shareBps: 2240 },
  { sport: "Tennis", turnoverRupees: 684174, shareBps: 1410 },
  { sport: "Basketball", turnoverRupees: 475525, shareBps: 980 },
  { sport: "Other", turnoverRupees: 363923, shareBps: 750 },
] as const;

export const topAgents = [
  { id: "AG-1042", name: "East Desk", users: 2140, turnoverRupees: 986400, ggrRupees: 142880 },
  { id: "AG-1108", name: "North Desk", users: 1866, turnoverRupees: 864220, ggrRupees: 121540 },
  { id: "AG-0988", name: "West Desk", users: 1544, turnoverRupees: 742150, ggrRupees: 98640 },
  { id: "AG-1214", name: "South Desk", users: 1298, turnoverRupees: 618900, ggrRupees: 87420 },
] as const;

export const liveOperations = [
  { id: "BET-88421", reference: "BET-88421", event: "MI vs CSK", market: "Match Odds", stakeRupees: 25000, status: "live", placedAt: "2026-09-28T07:42:11.000Z" },
  { id: "BET-88402", reference: "BET-88402", event: "Arsenal vs Chelsea", market: "Over 2.5", stakeRupees: 12500, status: "open", placedAt: "2026-09-28T07:36:04.000Z" },
  { id: "BET-88388", reference: "BET-88388", event: "Djokovic vs Alcaraz", market: "Match Winner", stakeRupees: 48000, status: "pending", placedAt: "2026-09-28T07:28:40.000Z" },
  { id: "BET-88371", reference: "BET-88371", event: "IND vs AUS", market: "Session 24", stakeRupees: 15000, status: "live", placedAt: "2026-09-28T07:21:18.000Z" },
  { id: "BET-88340", reference: "BET-88340", event: "Lakers vs Celtics", market: "Spread", stakeRupees: 8000, status: "settled", placedAt: "2026-09-28T06:58:02.000Z" },
  { id: "BET-88311", reference: "BET-88311", event: "MI vs CSK", market: "Tied Match", stakeRupees: 6400, status: "rejected", placedAt: "2026-09-28T06:44:27.000Z" },
  { id: "BET-88290", reference: "BET-88290", event: "Real Madrid vs Barcelona", market: "Match Odds", stakeRupees: 32000, status: "open", placedAt: "2026-09-28T06:31:55.000Z" },
  { id: "BET-88266", reference: "BET-88266", event: "IND vs AUS", market: "Match Odds", stakeRupees: 54000, status: "live", placedAt: "2026-09-28T06:12:09.000Z" },
  { id: "BET-88241", reference: "BET-88241", event: "Sinner vs Medvedev", market: "Set 1 Winner", stakeRupees: 9100, status: "settled", placedAt: "2026-09-28T05:48:33.000Z" },
  { id: "BET-88218", reference: "BET-88218", event: "Arsenal vs Chelsea", market: "Both Teams to Score", stakeRupees: 17600, status: "pending", placedAt: "2026-09-28T05:22:14.000Z" },
] as const;

export const riskAlerts = [
  { id: "AL-441", severity: "critical", title: "Exposure above desk threshold", detail: "MI vs CSK · Match Odds", at: "2026-09-28T07:58:00.000Z" },
  { id: "AL-438", severity: "warning", title: "Large stake waiting for acceptance", detail: "BET-88388 · ₹48,000.00", at: "2026-09-28T07:29:00.000Z" },
  { id: "AL-432", severity: "warning", title: "Provider latency elevated", detail: "Dummy Provider · odds feed 42 ms", at: "2026-09-28T07:05:00.000Z" },
  { id: "AL-428", severity: "info", title: "Settlement batch accepted", detail: "1,204 bets marked settled by the provider", at: "2026-09-28T06:40:00.000Z" },
] as const;

export const controlTimeline = [
  { id: "TL-1", title: "Provider sync completed", detail: "Dummy Provider · events and odds", at: "2026-09-28T08:14:12.000Z" },
  { id: "TL-2", title: "Settlement batch accepted", detail: "Provider reference SET-20260928-04", at: "2026-09-28T07:52:00.000Z" },
  { id: "TL-3", title: "Withdrawal queue reviewed", detail: "14 items still pending", at: "2026-09-28T07:28:00.000Z" },
  { id: "TL-4", title: "Market suspended by provider", detail: "IND vs AUS · Session 18", at: "2026-09-28T06:40:00.000Z" },
] as const;
