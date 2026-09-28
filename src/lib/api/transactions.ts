import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type {
  TransactionDetail,
  TransactionListQuery,
  TransactionListResponse,
} from "@/lib/validation/transactions";

export function listTransactions(query: TransactionListQuery) {
  return apiFetch<TransactionListResponse>(
    `/api/transactions${toQuery({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      status: query.status,
      type: query.type,
      flow: query.flow,
      agent: query.agent,
      created: query.created,
      sort: query.sort,
      direction: query.direction,
    })}`,
  );
}

export function getTransaction(transactionId: string) {
  return apiFetch<TransactionDetail>(`/api/transactions/${encodeURIComponent(transactionId)}`);
}
