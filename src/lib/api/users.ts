import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type {
  UserDetail,
  UserListQuery,
  UserListResponse,
  UserSessionView,
  UserStatusChange,
} from "@/lib/validation/users";

export function listUsers(query: UserListQuery) {
  return apiFetch<UserListResponse>(
    `/api/users${toQuery({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      status: query.status,
      agent: query.agent,
      created: query.created,
      balance: query.balance,
      activity: query.activity,
      betting: query.betting,
      sort: query.sort,
      direction: query.direction,
    })}`,
  );
}

export function getUser(userId: string) {
  return apiFetch<UserDetail>(`/api/users/${encodeURIComponent(userId)}`);
}

export function setUserStatus(userId: string, change: UserStatusChange) {
  return apiFetch<{ user: UserDetail["user"] }>(`/api/users/${encodeURIComponent(userId)}/status`, {
    method: "POST",
    body: JSON.stringify(change),
  });
}

export function revokeUserSession(userId: string, sessionId: string) {
  return apiFetch<{ userId: string; session: UserSessionView }>(
    `/api/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}/revoke`,
    { method: "POST" },
  );
}
