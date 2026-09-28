export const WALLET_AS_OF = "2026-09-28T08:15:00.000Z";

export type WalletOwnerType = "user" | "agent" | "system";
export type WalletStatus = "active" | "frozen" | "suspended" | "closed";

export type WalletAccountRecord = {
  walletId: string;
  ownerType: WalletOwnerType;
  ownerId: string;
  ownerName: string;
  agentId: string | null;
  agentName: string | null;
  status: WalletStatus;
  availableMinor: number;
  heldMinor: number;
  totalMinor: number;
  createdAt: string;
  lastActivityAt: string | null;
};

export type WalletSummaryFixture = {
  totalBalanceMinor: number;
  availableBalanceMinor: number;
  heldBalanceMinor: number;
  walletLiabilityMinor: number;
  userWalletBalanceMinor: number;
  agentWalletBalanceMinor: number;
  platformHeldMinor: number;
  activeWallets: number;
  frozenWallets: number;
  pendingWallets: number;
};

/**
 * Operations snapshot for the wallet overview. Independent of the dashboard
 * KPI snapshot and not derived by summing the wallet book in the UI.
 */
export const walletSummaryFixture: WalletSummaryFixture = {
  totalBalanceMinor: 8_205_000_00,
  availableBalanceMinor: 5_420_000_00,
  heldBalanceMinor: 815_000_00,
  walletLiabilityMinor: 6_235_000_00,
  userWalletBalanceMinor: 3_842_000_00,
  agentWalletBalanceMinor: 2_108_000_00,
  platformHeldMinor: 285_000_00,
  activeWallets: 38,
  frozenWallets: 4,
  pendingWallets: 2,
};

function userStatusToWallet(status: string): WalletStatus {
  if (status === "banned") return "closed";
  if (status === "locked") return "frozen";
  if (status === "suspended") return "suspended";
  return "active";
}

function agentStatusToWallet(status: string): WalletStatus {
  if (status === "inactive") return "closed";
  if (status === "suspended") return "frozen";
  if (status === "pending") return "suspended";
  return "active";
}

export function buildWalletAccounts(
  users: readonly {
    id: string;
    displayName: string;
    agentId: string;
    agentName: string;
    status: string;
    balanceMinor: number;
    heldMinor: number;
    createdAt: string;
    lastLoginAt: string | null;
  }[],
  agents: readonly {
    id: string;
    name: string;
    status: string;
    balanceMinor: number;
    heldMinor: number;
    createdAt: string;
  }[],
): WalletAccountRecord[] {
  const userAccounts: WalletAccountRecord[] = users.map((user) => ({
    walletId: `WLT-USER-${user.id}`,
    ownerType: "user",
    ownerId: user.id,
    ownerName: user.displayName,
    agentId: user.agentId,
    agentName: user.agentName,
    status: userStatusToWallet(user.status),
    availableMinor: user.balanceMinor,
    heldMinor: user.heldMinor,
    totalMinor: user.balanceMinor + user.heldMinor,
    createdAt: user.createdAt,
    lastActivityAt: user.lastLoginAt,
  }));

  const agentAccounts: WalletAccountRecord[] = agents.map((agent) => ({
    walletId: `WLT-AGENT-${agent.id}`,
    ownerType: "agent",
    ownerId: agent.id,
    ownerName: agent.name,
    agentId: agent.id,
    agentName: agent.name,
    status: agentStatusToWallet(agent.status),
    availableMinor: agent.balanceMinor,
    heldMinor: agent.heldMinor,
    totalMinor: agent.balanceMinor + agent.heldMinor,
    createdAt: agent.createdAt,
    lastActivityAt: agent.createdAt,
  }));

  const systemAccounts: WalletAccountRecord[] = [
    {
      walletId: "WLT-SYSTEM-OPS",
      ownerType: "system",
      ownerId: "SYS-OPS",
      ownerName: "Operations reserve",
      agentId: null,
      agentName: null,
      status: "active",
      availableMinor: 250_000_00,
      heldMinor: 35_000_00,
      totalMinor: 285_000_00,
      createdAt: "2025-01-10T04:00:00.000Z",
      lastActivityAt: "2026-09-28T07:55:00.000Z",
    },
    {
      walletId: "WLT-SYSTEM-ADJ",
      ownerType: "system",
      ownerId: "SYS-ADJ",
      ownerName: "Adjustment clearing",
      agentId: null,
      agentName: null,
      status: "active",
      availableMinor: -12_500_00,
      heldMinor: 0,
      totalMinor: -12_500_00,
      createdAt: "2025-03-01T04:00:00.000Z",
      lastActivityAt: "2026-09-20T08:15:00.000Z",
    },
  ];

  // Override last activity for selected desks to exercise activity filters.
  const tuned = [...userAccounts, ...agentAccounts, ...systemAccounts].map((account) => {
    if (account.walletId === "WLT-AGENT-AG-1042") {
      return { ...account, lastActivityAt: "2026-09-28T08:05:00.000Z" };
    }
    if (account.walletId === "WLT-USER-27411") {
      return { ...account, lastActivityAt: "2026-09-28T07:40:00.000Z" };
    }
    if (account.walletId === "WLT-USER-61002") {
      return { ...account, lastActivityAt: null };
    }
    return account;
  });

  return tuned;
}

export function findWalletBalances(
  accounts: readonly WalletAccountRecord[],
  ownerType: WalletOwnerType,
  ownerId: string,
): { availableMinor: number; heldMinor: number; totalMinor: number; walletId: string; status: WalletStatus } | null {
  const account = accounts.find((item) => item.ownerType === ownerType && item.ownerId === ownerId);
  if (!account) return null;
  return {
    availableMinor: account.availableMinor,
    heldMinor: account.heldMinor,
    totalMinor: account.totalMinor,
    walletId: account.walletId,
    status: account.status,
  };
}
