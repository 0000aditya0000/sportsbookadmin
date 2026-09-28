import type { AppNotification } from "@/lib/validation/notifications";

export const notifications: readonly AppNotification[] = [
  {
    id: "NT-901",
    severity: "critical",
    title: "Large withdrawal waiting",
    body: "WD-19022 for ₹1,50,000.00 is pending review. Approval is not available in this release.",
    at: "2026-09-28T07:56:00.000Z",
    reference: "WD-19022",
  },
  {
    id: "NT-898",
    severity: "critical",
    title: "High exposure",
    body: "MI vs CSK match odds is the highest open exposure on the board.",
    at: "2026-09-28T07:58:00.000Z",
    reference: "EVT-MI-CSK",
  },
  {
    id: "NT-890",
    severity: "warning",
    title: "Provider latency",
    body: "Dummy Provider odds feed last responded in 42 ms. The feed is still connected.",
    at: "2026-09-28T07:05:00.000Z",
    reference: "DUMMY",
  },
  {
    id: "NT-884",
    severity: "warning",
    title: "Market suspended",
    body: "IND vs AUS session 18 was suspended by the provider.",
    at: "2026-09-28T06:40:00.000Z",
    reference: "MKT-SESS-18",
  },
  {
    id: "NT-870",
    severity: "info",
    title: "Settlement batch accepted",
    body: "The provider accepted settlement batch SET-20260928-04.",
    at: "2026-09-28T07:52:00.000Z",
    reference: "SET-20260928-04",
  },
];
