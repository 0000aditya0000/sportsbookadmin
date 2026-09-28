import { apiFetch } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { WalletListQuery, WalletListResponse } from "@/lib/validation/wallet";

export function listWallets(query: WalletListQuery) {
  return apiFetch<WalletListResponse>(
    `/api/wallet${toQuery({
      page: query.page,
      pageSize: query.pageSize,
      q: query.q,
      type: query.type,
      status: query.status,
      agent: query.agent,
      balance: query.balance,
      activity: query.activity,
      created: query.created,
      sort: query.sort,
      direction: query.direction,
    })}`,
  );
}
