import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { ResourceList } from "@/types/api";

export type SessionListItem = {
  id: string;
  userId: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  loginAt: string;
  lastActivityAt: string;
  status: "active" | "revoked" | "expired";
  expiresAt: string;
};

export function listSessions(query: { page?: number; q?: string } = {}) {
  return apiFetch<ResourceList<SessionListItem>>(`/api/sessions${toQuery(query)}`);
}
