import { apiFetch } from "@/lib/api/client";
import { dashboardSchema, type DashboardQuery, type DashboardSnapshot } from "@/lib/validation/dashboard";
import { toQuery } from "@/lib/api/query-string";

export async function getDashboard(query: DashboardQuery) {
  const result = await apiFetch<unknown>(`/api/dashboard${toQuery(query)}`);
  return {
    snapshot: dashboardSchema.parse(result.data),
    requestId: result.requestId,
  };
}

export type { DashboardSnapshot };
