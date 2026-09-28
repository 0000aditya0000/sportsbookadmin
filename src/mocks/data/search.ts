import type { SearchResult } from "@/lib/validation/search";

export const searchIndex: readonly SearchResult[] = [
  { id: "USR-27411", type: "user", title: "User 27411", subtitle: "Active · East Desk", href: "/users/27411" },
  { id: "BET-27411", type: "bet", title: "BET-27411", subtitle: "MI vs CSK · Match Odds", href: "/bets/27411" },
  { id: "TXN-27411", type: "transaction", title: "TXN-27411", subtitle: "Wallet credit · ₹12,450.00", href: "/transactions" },
  { id: "SES-27411", type: "session", title: "SES-27411", subtitle: "Active · Chrome · Mumbai", href: "/sessions" },
  { id: "AG-1042", type: "agent", title: "East Desk", subtitle: "AG-1042 · Active", href: "/agents/AG-1042" },
  { id: "AG-1108", type: "agent", title: "North Desk", subtitle: "AG-1108 · Active", href: "/agents/AG-1108" },
  { id: "EVT-IND-AUS", type: "event", title: "IND vs AUS", subtitle: "Cricket · Live", href: "/events/EVT-IND-AUS" },
  { id: "EVT-MI-CSK", type: "event", title: "MI vs CSK", subtitle: "Cricket · Live", href: "/events/EVT-MI-CSK" },
  { id: "WD-19022", type: "withdrawal", title: "WD-19022", subtitle: "Pending · ₹1,50,000.00", href: "/withdrawals" },
  { id: "DEP-4410", type: "deposit", title: "DEP-4410", subtitle: "Success · ₹25,000.00", href: "/deposits" },
  { id: "USR-19022", type: "user", title: "User 19022", subtitle: "Active · North Desk", href: "/users/19022" },
  { id: "BET-88421", type: "bet", title: "BET-88421", subtitle: "Live · MI vs CSK", href: "/bets/BET-88421" },
];
