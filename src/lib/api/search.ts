import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import { searchResponseSchema, type SearchResponse } from "@/lib/validation/search";

export async function searchPlatform(query: string): Promise<SearchResponse> {
  const result = await apiFetch<unknown>(`/api/search${toQuery({ q: query })}`);
  return searchResponseSchema.parse(result.data);
}
