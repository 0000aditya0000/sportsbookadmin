import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { listWalletRecords } from "@/mocks/services/wallet-service";
import { walletListQuerySchema } from "@/lib/validation/wallet";

export const dynamic = "force-dynamic";

function numberParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.WALLET_VIEW);
  if (!access.ok) return access.response;

  const params = new URL(request.url).searchParams;
  const parsed = walletListQuerySchema.safeParse({
    page: numberParam(params.get("page")),
    pageSize: numberParam(params.get("pageSize")),
    q: params.get("q") ?? "",
    type: params.get("type") ?? undefined,
    status: params.get("status") ?? undefined,
    agent: params.get("agent") ?? undefined,
    balance: params.get("balance") ?? undefined,
    activity: params.get("activity") ?? undefined,
    created: params.get("created") ?? undefined,
    sort: params.get("sort") ?? undefined,
    direction: params.get("direction") ?? undefined,
  });
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", "Those filters are not valid.");
  return apiOk(listWalletRecords(parsed.data));
}
