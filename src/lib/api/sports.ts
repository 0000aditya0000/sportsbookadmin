import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { SportDetail, SportListQuery, SportListResponse } from "@/lib/validation/sports";

export function listSports(query: SportListQuery) {
  return apiFetch<SportListResponse>(
    `/api/sports${toQuery({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      status: query.status,
      provider: query.provider,
      activity: query.activity,
      updated: query.updated,
      sort: query.sort,
      direction: query.direction,
    })}`,
  );
}

export function getSport(sportId: string) {
  return apiFetch<SportDetail>(`/api/sports/${encodeURIComponent(sportId)}`);
}
