import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { ResourceList } from "@/types/api";
import type { BetListItem } from "@/types/resources";

type ListQuery = { page?: number; pageSize?: number; q?: string };

export function listBets(query: ListQuery = {}) {
  return apiFetch<ResourceList<BetListItem>>(`/api/bets${toQuery(query)}`);
}

export function getBet(betId: string) {
  return apiFetch<BetListItem>(`/api/bets/${encodeURIComponent(betId)}`);
}
