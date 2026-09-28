import type { Money } from "@/lib/format";

export type AccountStatus = "active" | "suspended" | "banned" | "locked";

export type { UserListItem } from "@/lib/validation/users";

export type AgentStatus = "active" | "suspended" | "pending" | "inactive";

export type AgentListItem = {
  id: string;
  name: string;
  contactName: string;
  username: string;
  email: string;
  phone: string;
  status: AgentStatus;
  users: number;
  activeUsers: number;
  balance: Money;
  turnover: Money;
  ggr: Money;
  commission: Money;
  exposure: Money;
  shareBps: number;
  activity: "trading" | "quiet";
  createdAt: string;
};

export type BetListItem = {
  id: string;
  userId: string;
  agentId: string;
  eventName: string;
  marketName: string;
  betType: string;
  stake: Money;
  odds: string;
  potentialPayout: Money;
  provider: string;
  status: string;
  placedAt: string;
};

export type WalletTransaction = {
  id: string;
  userId: string;
  agentId: string;
  type: string;
  amount: Money;
  direction: "credit" | "debit";
  status: string;
  reference: string;
  createdAt: string;
};
