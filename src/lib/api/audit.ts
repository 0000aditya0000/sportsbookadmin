import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { ResourceList } from "@/types/api";

export type AuditListItem = {
  id: string;
  at: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  resourceId: string;
  ip: string;
  requestId: string;
  status: string;
};

export function listAuditLogs(query: { page?: number; q?: string } = {}) {
  return apiFetch<ResourceList<AuditListItem>>(`/api/audit-logs${toQuery(query)}`);
}
