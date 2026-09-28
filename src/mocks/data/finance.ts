export const FINANCE_AS_OF = "2026-09-28T08:15:00.000Z";

export type TransactionDirection = "credit" | "debit";
export type TransactionStatus = "posted" | "pending" | "failed";
export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "bet_stake"
  | "bet_settlement"
  | "hold"
  | "release"
  | "adjustment"
  | "commission";

export type DepositStatus = "pending" | "completed" | "rejected" | "reversed";
export type WithdrawalStatus = "pending" | "approved" | "rejected" | "paid" | "failed";

export type TransactionRecord = {
  id: string;
  userId: string;
  userName: string;
  agentId: string;
  agentName: string;
  walletId: string;
  type: TransactionType;
  direction: TransactionDirection;
  amountMinor: number;
  status: TransactionStatus;
  reference: string;
  createdAt: string;
};

export type DepositRecord = {
  id: string;
  userId: string;
  userName: string;
  agentId: string;
  agentName: string;
  amountMinor: number;
  status: DepositStatus;
  method: string;
  providerReference: string;
  createdAt: string;
  updatedAt: string;
  reason: string | null;
};

export type WithdrawalRecord = {
  id: string;
  userId: string;
  userName: string;
  agentId: string;
  agentName: string;
  amountMinor: number;
  status: WithdrawalStatus;
  method: string;
  providerReference: string;
  createdAt: string;
  updatedAt: string;
  reason: string | null;
};

function rupees(amount: number): number {
  if (!Number.isInteger(amount)) throw new Error("Fixture amounts must be integer rupees.");
  return amount * 100;
}

export const seedTransactions: TransactionRecord[] = [
  {
    id: "TXN-90001",
    userId: "27411",
    userName: "Aditya Sharma",
    agentId: "AG-1042",
    agentName: "East Desk",
    walletId: "WLT-USER-27411",
    type: "deposit",
    direction: "credit",
    amountMinor: rupees(25000),
    status: "posted",
    reference: "DEP-10021",
    createdAt: "2026-09-28T06:10:00.000Z",
  },
  {
    id: "TXN-90002",
    userId: "27411",
    userName: "Aditya Sharma",
    agentId: "AG-1042",
    agentName: "East Desk",
    walletId: "WLT-USER-27411",
    type: "bet_stake",
    direction: "debit",
    amountMinor: rupees(2500),
    status: "posted",
    reference: "BET-88421",
    createdAt: "2026-09-28T07:05:00.000Z",
  },
  {
    id: "TXN-90003",
    userId: "33108",
    userName: "Sana Qureshi",
    agentId: "AG-1042",
    agentName: "East Desk",
    walletId: "WLT-USER-33108",
    type: "withdrawal",
    direction: "debit",
    amountMinor: rupees(15000),
    status: "pending",
    reference: "WD-19022",
    createdAt: "2026-09-28T07:20:00.000Z",
  },
  {
    id: "TXN-90004",
    userId: "19022",
    userName: "Kabir Menon",
    agentId: "AG-1108",
    agentName: "North Desk",
    walletId: "WLT-USER-19022",
    type: "deposit",
    direction: "credit",
    amountMinor: rupees(10000),
    status: "posted",
    reference: "DEP-10022",
    createdAt: "2026-09-27T11:00:00.000Z",
  },
  {
    id: "TXN-90005",
    userId: "61003",
    userName: "Arjun Sethi",
    agentId: "AG-1042",
    agentName: "East Desk",
    walletId: "WLT-USER-61003",
    type: "hold",
    direction: "debit",
    amountMinor: rupees(12000),
    status: "posted",
    reference: "HLD-61003",
    createdAt: "2026-09-28T05:40:00.000Z",
  },
  {
    id: "TXN-90006",
    userId: "22814",
    userName: "Rohan Desai",
    agentId: "AG-0988",
    agentName: "West Desk",
    walletId: "WLT-USER-22814",
    type: "adjustment",
    direction: "credit",
    amountMinor: rupees(500),
    status: "failed",
    reference: "ADJ-22814",
    createdAt: "2026-09-26T09:15:00.000Z",
  },
  {
    id: "TXN-90007",
    userId: "27411",
    userName: "Aditya Sharma",
    agentId: "AG-1042",
    agentName: "East Desk",
    walletId: "WLT-USER-27411",
    type: "bet_settlement",
    direction: "credit",
    amountMinor: rupees(4200),
    status: "posted",
    reference: "BET-77102",
    createdAt: "2026-09-27T18:22:00.000Z",
  },
  {
    id: "TXN-90008",
    userId: "55201",
    userName: "Dev Nair",
    agentId: "AG-1302",
    agentName: "Central Desk",
    walletId: "WLT-USER-55201",
    type: "release",
    direction: "credit",
    amountMinor: rupees(0),
    status: "posted",
    reference: "REL-55201",
    createdAt: "2026-09-20T08:15:00.000Z",
  },
  {
    id: "TXN-90009",
    userId: "33108",
    userName: "Sana Qureshi",
    agentId: "AG-1042",
    agentName: "East Desk",
    walletId: "WLT-USER-33108",
    type: "deposit",
    direction: "credit",
    amountMinor: rupees(40000),
    status: "posted",
    reference: "DEP-10023",
    createdAt: "2026-09-28T04:05:00.000Z",
  },
  {
    id: "TXN-90010",
    userId: "19022",
    userName: "Kabir Menon",
    agentId: "AG-1108",
    agentName: "North Desk",
    walletId: "WLT-USER-19022",
    type: "withdrawal",
    direction: "debit",
    amountMinor: rupees(8000),
    status: "posted",
    reference: "WD-19001",
    createdAt: "2026-09-25T14:30:00.000Z",
  },
  {
    id: "TXN-90011",
    userId: "44190",
    userName: "Anika Rao",
    agentId: "AG-1214",
    agentName: "South Desk",
    walletId: "WLT-USER-44190",
    type: "deposit",
    direction: "credit",
    amountMinor: rupees(5000),
    status: "pending",
    reference: "DEP-10024",
    createdAt: "2026-09-28T07:50:00.000Z",
  },
  {
    id: "TXN-90012",
    userId: "61002",
    userName: "Meera Iyer",
    agentId: "AG-1042",
    agentName: "East Desk",
    walletId: "WLT-USER-61002",
    type: "commission",
    direction: "debit",
    amountMinor: rupees(120),
    status: "posted",
    reference: "COM-61002",
    createdAt: "2026-09-24T10:00:00.000Z",
  },
];

// Expand to ~36 transactions with deterministic generated rows.
for (let i = 0; i < 24; i += 1) {
  const id = 42000 + i;
  const agentId = i % 2 === 0 ? "AG-1042" : "AG-1108";
  const agentName = agentId === "AG-1042" ? "East Desk" : "North Desk";
  seedTransactions.push({
    id: `TXN-91${String(i).padStart(3, "0")}`,
    userId: String(id),
    userName: `User ${id}`,
    agentId,
    agentName,
    walletId: `WLT-USER-${id}`,
    type: i % 3 === 0 ? "deposit" : i % 3 === 1 ? "bet_stake" : "withdrawal",
    direction: i % 3 === 1 || i % 3 === 2 ? "debit" : "credit",
    amountMinor: rupees(1000 + i * 250),
    status: i % 7 === 0 ? "pending" : i % 11 === 0 ? "failed" : "posted",
    reference: `REF-${id}`,
    createdAt: `2026-09-${String(10 + (i % 18)).padStart(2, "0")}T${String(8 + (i % 10)).padStart(2, "0")}:15:00.000Z`,
  });
}

export const seedDeposits: DepositRecord[] = [
  {
    id: "DEP-10021",
    userId: "27411",
    userName: "Aditya Sharma",
    agentId: "AG-1042",
    agentName: "East Desk",
    amountMinor: rupees(25000),
    status: "completed",
    method: "UPI",
    providerReference: "PAY-DEP-10021",
    createdAt: "2026-09-28T06:08:00.000Z",
    updatedAt: "2026-09-28T06:10:00.000Z",
    reason: null,
  },
  {
    id: "DEP-10022",
    userId: "19022",
    userName: "Kabir Menon",
    agentId: "AG-1108",
    agentName: "North Desk",
    amountMinor: rupees(10000),
    status: "completed",
    method: "Bank transfer",
    providerReference: "PAY-DEP-10022",
    createdAt: "2026-09-27T10:50:00.000Z",
    updatedAt: "2026-09-27T11:00:00.000Z",
    reason: null,
  },
  {
    id: "DEP-10023",
    userId: "33108",
    userName: "Sana Qureshi",
    agentId: "AG-1042",
    agentName: "East Desk",
    amountMinor: rupees(40000),
    status: "completed",
    method: "UPI",
    providerReference: "PAY-DEP-10023",
    createdAt: "2026-09-28T04:00:00.000Z",
    updatedAt: "2026-09-28T04:05:00.000Z",
    reason: null,
  },
  {
    id: "DEP-10024",
    userId: "44190",
    userName: "Anika Rao",
    agentId: "AG-1214",
    agentName: "South Desk",
    amountMinor: rupees(5000),
    status: "pending",
    method: "UPI",
    providerReference: "PAY-DEP-10024",
    createdAt: "2026-09-28T07:48:00.000Z",
    updatedAt: "2026-09-28T07:48:00.000Z",
    reason: null,
  },
  {
    id: "DEP-10025",
    userId: "61003",
    userName: "Arjun Sethi",
    agentId: "AG-1042",
    agentName: "East Desk",
    amountMinor: rupees(75000),
    status: "pending",
    method: "Bank transfer",
    providerReference: "PAY-DEP-10025",
    createdAt: "2026-09-28T07:10:00.000Z",
    updatedAt: "2026-09-28T07:10:00.000Z",
    reason: null,
  },
  {
    id: "DEP-10026",
    userId: "22814",
    userName: "Rohan Desai",
    agentId: "AG-0988",
    agentName: "West Desk",
    amountMinor: rupees(3000),
    status: "rejected",
    method: "UPI",
    providerReference: "PAY-DEP-10026",
    createdAt: "2026-09-26T08:00:00.000Z",
    updatedAt: "2026-09-26T09:00:00.000Z",
    reason: "Name mismatch on the remitter account.",
  },
  {
    id: "DEP-10027",
    userId: "55201",
    userName: "Dev Nair",
    agentId: "AG-1302",
    agentName: "Central Desk",
    amountMinor: rupees(2000),
    status: "reversed",
    method: "UPI",
    providerReference: "PAY-DEP-10027",
    createdAt: "2026-09-18T12:00:00.000Z",
    updatedAt: "2026-09-19T08:00:00.000Z",
    reason: "Provider reversal after chargeback.",
  },
];

for (let i = 0; i < 15; i += 1) {
  const id = 42100 + i;
  seedDeposits.push({
    id: `DEP-11${String(i).padStart(3, "0")}`,
    userId: String(id),
    userName: `User ${id}`,
    agentId: i % 2 === 0 ? "AG-1042" : "AG-1108",
    agentName: i % 2 === 0 ? "East Desk" : "North Desk",
    amountMinor: rupees(2000 + i * 500),
    status: i % 5 === 0 ? "pending" : i % 8 === 0 ? "rejected" : "completed",
    method: i % 2 === 0 ? "UPI" : "Bank transfer",
    providerReference: `PAY-DEP-11${String(i).padStart(3, "0")}`,
    createdAt: `2026-09-${String(12 + (i % 16)).padStart(2, "0")}T09:00:00.000Z`,
    updatedAt: `2026-09-${String(12 + (i % 16)).padStart(2, "0")}T09:20:00.000Z`,
    reason: i % 8 === 0 ? "Incomplete remitter details." : null,
  });
}

export const seedWithdrawals: WithdrawalRecord[] = [
  {
    id: "WD-19022",
    userId: "33108",
    userName: "Sana Qureshi",
    agentId: "AG-1042",
    agentName: "East Desk",
    amountMinor: rupees(150000),
    status: "pending",
    method: "Bank transfer",
    providerReference: "PAY-WD-19022",
    createdAt: "2026-09-28T07:15:00.000Z",
    updatedAt: "2026-09-28T07:15:00.000Z",
    reason: null,
  },
  {
    id: "WD-19001",
    userId: "19022",
    userName: "Kabir Menon",
    agentId: "AG-1108",
    agentName: "North Desk",
    amountMinor: rupees(8000),
    status: "paid",
    method: "UPI",
    providerReference: "PAY-WD-19001",
    createdAt: "2026-09-25T13:00:00.000Z",
    updatedAt: "2026-09-25T14:30:00.000Z",
    reason: null,
  },
  {
    id: "WD-19030",
    userId: "27411",
    userName: "Aditya Sharma",
    agentId: "AG-1042",
    agentName: "East Desk",
    amountMinor: rupees(12000),
    status: "pending",
    method: "UPI",
    providerReference: "PAY-WD-19030",
    createdAt: "2026-09-28T07:40:00.000Z",
    updatedAt: "2026-09-28T07:40:00.000Z",
    reason: null,
  },
  {
    id: "WD-19031",
    userId: "61003",
    userName: "Arjun Sethi",
    agentId: "AG-1042",
    agentName: "East Desk",
    amountMinor: rupees(50000),
    status: "approved",
    method: "Bank transfer",
    providerReference: "PAY-WD-19031",
    createdAt: "2026-09-27T16:00:00.000Z",
    updatedAt: "2026-09-28T05:00:00.000Z",
    reason: null,
  },
  {
    id: "WD-19032",
    userId: "22814",
    userName: "Rohan Desai",
    agentId: "AG-0988",
    agentName: "West Desk",
    amountMinor: rupees(4500),
    status: "rejected",
    method: "UPI",
    providerReference: "PAY-WD-19032",
    createdAt: "2026-09-26T11:00:00.000Z",
    updatedAt: "2026-09-26T12:30:00.000Z",
    reason: "Account under review after suspension.",
  },
  {
    id: "WD-19033",
    userId: "44190",
    userName: "Anika Rao",
    agentId: "AG-1214",
    agentName: "South Desk",
    amountMinor: rupees(2200),
    status: "failed",
    method: "Bank transfer",
    providerReference: "PAY-WD-19033",
    createdAt: "2026-09-22T09:00:00.000Z",
    updatedAt: "2026-09-22T10:00:00.000Z",
    reason: "Beneficiary bank rejected the payout.",
  },
];

for (let i = 0; i < 14; i += 1) {
  const id = 42200 + i;
  seedWithdrawals.push({
    id: `WD-20${String(i).padStart(3, "0")}`,
    userId: String(id),
    userName: `User ${id}`,
    agentId: i % 2 === 0 ? "AG-1042" : "AG-1520",
    agentName: i % 2 === 0 ? "East Desk" : "Ridge Desk",
    amountMinor: rupees(3000 + i * 750),
    status: i % 4 === 0 ? "pending" : i % 5 === 0 ? "rejected" : i % 3 === 0 ? "approved" : "paid",
    method: i % 2 === 0 ? "UPI" : "Bank transfer",
    providerReference: `PAY-WD-20${String(i).padStart(3, "0")}`,
    createdAt: `2026-09-${String(11 + (i % 17)).padStart(2, "0")}T11:00:00.000Z`,
    updatedAt: `2026-09-${String(11 + (i % 17)).padStart(2, "0")}T12:00:00.000Z`,
    reason: i % 5 === 0 ? "Insufficient verified balance." : null,
  });
}

export const transactionSummaryFixture = {
  total: seedTransactions.length,
  posted: seedTransactions.filter((item) => item.status === "posted").length,
  pending: seedTransactions.filter((item) => item.status === "pending").length,
  failed: seedTransactions.filter((item) => item.status === "failed").length,
  creditVolumeMinor: 4_820_000_00,
  debitVolumeMinor: 3_640_000_00,
};

export const depositSummaryFixture = {
  total: seedDeposits.length,
  pending: seedDeposits.filter((item) => item.status === "pending").length,
  completed: seedDeposits.filter((item) => item.status === "completed").length,
  rejected: seedDeposits.filter((item) => item.status === "rejected").length,
  reversed: seedDeposits.filter((item) => item.status === "reversed").length,
  pendingAmountMinor: 4_62_000_00,
  completedAmountMinor: 18_40_000_00,
};

export const withdrawalSummaryFixture = {
  total: seedWithdrawals.length,
  pending: seedWithdrawals.filter((item) => item.status === "pending").length,
  approved: seedWithdrawals.filter((item) => item.status === "approved").length,
  rejected: seedWithdrawals.filter((item) => item.status === "rejected").length,
  paid: seedWithdrawals.filter((item) => item.status === "paid").length,
  pendingAmountMinor: 4_62_000_00,
  paidAmountMinor: 11_25_500_00,
};
