import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { ResourceList } from "@/types/api";

export type MarketListItem = {
  id: string;
  name: string;
  eventName: string;
  sport: string;
  status: string;
  selections: number;
  oddsStatus: string;
  provider: string;
  updatedAt: string;
};

export function listMarkets(query: { page?: number; q?: string } = {}) {
  return apiFetch<ResourceList<MarketListItem>>(`/api/markets${toQuery(query)}`);
}

export function getMarket(marketId: string) {
  return apiFetch<MarketListItem>(`/api/markets/${encodeURIComponent(marketId)}`);
}
