import "server-only";

import type { Money } from "@/lib/format";
import type { SearchResult } from "@/lib/validation/search";
import {
  walletListResponseSchema,
  type WalletListQuery,
  type WalletListResponse,
} from "@/lib/validation/wallet";
import { seedAgents } from "@/mocks/data/agents";
import { buildSeedUsers } from "@/mocks/data/users";
import {
  buildWalletAccounts,
  findWalletBalances,
  WALLET_AS_OF,
  walletSummaryFixture,
  type WalletOwnerType,
} from "@/mocks/data/wallet";
import { queryWallets } from "@/mocks/wallet-query";

const ACTIVITY_MESSAGE = "Transaction operations are introduced in a later Meridian release.";

function money(amountMinor: number): Money {
  return { amountMinor, currency: "INR" };
}

const accounts = buildWalletAccounts(buildSeedUsers(), seedAgents);

export function listWalletRecords(query: WalletListQuery): WalletListResponse {
  const result = queryWallets(accounts, query);
  const agents = [
    ...new Map(
      accounts
        .filter((account) => account.agentId && account.agentName)
        .map((account) => [account.agentId!, { id: account.agentId!, name: account.agentName! }]),
    ).values(),
  ].sort((left, right) => left.name.localeCompare(right.name));

  const summary = walletSummaryFixture;

  return walletListResponseSchema.parse({
    source: "mock",
    generatedAt: WALLET_AS_OF,
    summary: {
      totalBalance: money(summary.totalBalanceMinor),
      availableBalance: money(summary.availableBalanceMinor),
      heldBalance: money(summary.heldBalanceMinor),
      walletLiability: money(summary.walletLiabilityMinor),
      userWalletBalance: money(summary.userWalletBalanceMinor),
      agentWalletBalance: money(summary.agentWalletBalanceMinor),
      platformHeld: money(summary.platformHeldMinor),
      activeWallets: summary.activeWallets,
      frozenWallets: summary.frozenWallets,
      pendingWallets: summary.pendingWallets,
    },
    agents,
    activityAvailable: false,
    activityMessage: ACTIVITY_MESSAGE,
    items: result.items.map((account) => ({
      id: account.walletId,
      walletId: account.walletId,
      ownerType: account.ownerType,
      ownerId: account.ownerId,
      ownerName: account.ownerName,
      agentId: account.agentId,
      agentName: account.agentName,
      status: account.status,
      availableBalance: money(account.availableMinor),
      heldBalance: money(account.heldMinor),
      totalBalance: money(account.totalMinor),
      createdAt: account.createdAt,
      lastActivityAt: account.lastActivityAt,
    })),
    page: query.page,
    pageSize: query.pageSize,
    total: result.total,
  });
}

export function ownerWalletBalances(ownerType: WalletOwnerType, ownerId: string) {
  return findWalletBalances(accounts, ownerType, ownerId);
}

export function walletSearchHits(): SearchResult[] {
  return accounts.map((account) => ({
    id: account.walletId,
    type: "wallet" as const,
    title: account.ownerName,
    subtitle: `${account.walletId} · ${account.ownerType}`,
    href:
      account.ownerType === "user"
        ? `/users/${account.ownerId}?tab=wallet`
        : account.ownerType === "agent"
          ? `/agents/${account.ownerId}?tab=wallet`
          : "/wallet",
  }));
}
