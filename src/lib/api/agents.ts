import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type {
  AgentDetail,
  AgentListQuery,
  AgentListResponse,
  AgentStatusChange,
  CreateAgentInput,
  UpdateAgentInput,
} from "@/lib/validation/agents";

export function listAgents(query: AgentListQuery) {
  return apiFetch<AgentListResponse>(
    `/api/agents${toQuery({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      status: query.status,
      created: query.created,
      balance: query.balance,
      performance: query.performance,
      activity: query.activity,
      sort: query.sort,
      direction: query.direction,
    })}`,
  );
}

export function getAgent(agentId: string) {
  return apiFetch<AgentDetail>(`/api/agents/${encodeURIComponent(agentId)}`);
}

export function createAgent(input: CreateAgentInput) {
  return apiFetch<AgentDetail>("/api/agents", { method: "POST", body: JSON.stringify(input) });
}

export function updateAgent(agentId: string, input: UpdateAgentInput) {
  return apiFetch<AgentDetail>(`/api/agents/${encodeURIComponent(agentId)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function setAgentStatus(agentId: string, change: AgentStatusChange) {
  return apiFetch<AgentDetail>(`/api/agents/${encodeURIComponent(agentId)}/status`, {
    method: "POST",
    body: JSON.stringify(change),
  });
}
