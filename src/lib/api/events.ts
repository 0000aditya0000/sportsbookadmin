import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { EventDetail, EventListQuery, EventListResponse } from "@/lib/validation/events";

export function listEvents(query: EventListQuery) {
  return apiFetch<EventListResponse>(
    `/api/events${toQuery({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      sport: query.sport,
      competition: query.competition,
      status: query.status,
      provider: query.provider,
      start: query.start,
      timing: query.timing,
      sort: query.sort,
      direction: query.direction,
    })}`,
  );
}

export function getEvent(eventId: string) {
  return apiFetch<EventDetail>(`/api/events/${encodeURIComponent(eventId)}`);
}
