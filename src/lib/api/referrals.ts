import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type {
  AgentReferralDetail,
  CommissionConfigResponse,
  CommissionConfigUpdate,
  ReferralCommissionDetail,
  ReferralCommissionListQuery,
  ReferralCommissionListResponse,
  ReferralReportQuery,
  ReferralReportResponse,
  ReferralTreeResponse,
  ReferralUserListQuery,
  ReferralUserListResponse,
  UserReferralDetail,
} from "@/lib/validation/referrals";

export function listReferralUsers(query: ReferralUserListQuery) {
  return apiFetch<ReferralUserListResponse>(
    `/api/referrals${toQuery({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      referrer: query.referrer,
      agent: query.agent,
      level: query.level,
      source: query.source,
      status: query.status,
      registered: query.registered,
      sort: query.sort,
      direction: query.direction,
    })}`,
  );
}

export function getReferralTree(userId: string) {
  return apiFetch<ReferralTreeResponse>(`/api/referrals/tree${toQuery({ userId })}`);
}

export function getUserReferral(userId: string) {
  return apiFetch<UserReferralDetail>(`/api/referrals/users/${encodeURIComponent(userId)}`);
}

export function getAgentReferral(agentId: string) {
  return apiFetch<AgentReferralDetail>(`/api/referrals/agents/${encodeURIComponent(agentId)}`);
}

export function listReferralCommissions(query: ReferralCommissionListQuery) {
  return apiFetch<ReferralCommissionListResponse>(
    `/api/referrals/commissions${toQuery({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      beneficiary: query.beneficiary,
      betUser: query.betUser,
      betId: query.betId,
      level: query.level,
      agent: query.agent,
      status: query.status,
      created: query.created,
      sort: query.sort,
      direction: query.direction,
    })}`,
  );
}

export function getReferralCommission(commissionId: string) {
  return apiFetch<ReferralCommissionDetail>(
    `/api/referrals/commissions/${encodeURIComponent(commissionId)}`,
  );
}

export function getCommissionConfig() {
  return apiFetch<CommissionConfigResponse>(`/api/referrals/commission-config`);
}

export function updateCommissionConfig(change: CommissionConfigUpdate) {
  return apiFetch<CommissionConfigResponse>(`/api/referrals/commission-config`, {
    method: "PUT",
    body: JSON.stringify(change),
  });
}

export function getReferralReports(query: ReferralReportQuery) {
  return apiFetch<ReferralReportResponse>(
    `/api/referrals/reports${toQuery({
      created: query.created,
      agent: query.agent,
      level: query.level,
      status: query.status,
    })}`,
  );
}
