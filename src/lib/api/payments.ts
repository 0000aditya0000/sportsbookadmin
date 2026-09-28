import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type {
  DepositDetail,
  DepositListQuery,
  DepositListResponse,
  DepositStatusChange,
} from "@/lib/validation/deposits";
import type {
  WithdrawalDetail,
  WithdrawalListQuery,
  WithdrawalListResponse,
  WithdrawalStatusChange,
} from "@/lib/validation/withdrawals";

export function listDeposits(query: DepositListQuery) {
  return apiFetch<DepositListResponse>(
    `/api/deposits${toQuery({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      status: query.status,
      agent: query.agent,
      method: query.method,
      created: query.created,
      sort: query.sort,
      direction: query.direction,
    })}`,
  );
}

export function getDeposit(depositId: string) {
  return apiFetch<DepositDetail>(`/api/deposits/${encodeURIComponent(depositId)}`);
}

export function setDepositStatus(depositId: string, change: DepositStatusChange) {
  return apiFetch<{ deposit: DepositDetail["deposit"] }>(
    `/api/deposits/${encodeURIComponent(depositId)}/status`,
    { method: "POST", body: JSON.stringify(change) },
  );
}

export function listWithdrawals(query: WithdrawalListQuery) {
  return apiFetch<WithdrawalListResponse>(
    `/api/withdrawals${toQuery({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      status: query.status,
      agent: query.agent,
      method: query.method,
      created: query.created,
      sort: query.sort,
      direction: query.direction,
    })}`,
  );
}

export function getWithdrawal(withdrawalId: string) {
  return apiFetch<WithdrawalDetail>(`/api/withdrawals/${encodeURIComponent(withdrawalId)}`);
}

export function setWithdrawalStatus(withdrawalId: string, change: WithdrawalStatusChange) {
  return apiFetch<{ withdrawal: WithdrawalDetail["withdrawal"] }>(
    `/api/withdrawals/${encodeURIComponent(withdrawalId)}/status`,
    { method: "POST", body: JSON.stringify(change) },
  );
}
