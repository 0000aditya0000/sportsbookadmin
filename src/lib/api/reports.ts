import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";

export type ReportQuery = {
  report: string;
  from?: string;
  to?: string;
};

export function getReport(query: ReportQuery) {
  return apiFetch<unknown>(`/api/reports${toQuery(query)}`);
}
