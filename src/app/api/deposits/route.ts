import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { listDepositRecords } from "@/mocks/services/deposit-service";
import { depositListQuerySchema } from "@/lib/validation/deposits";

export const dynamic = "force-dynamic";

function numberParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.DEPOSIT_VIEW);
  if (!access.ok) return access.response;
  const params = new URL(request.url).searchParams;
  const parsed = depositListQuerySchema.safeParse({
    page: numberParam(params.get("page")),
    pageSize: numberParam(params.get("pageSize")),
    q: params.get("q") ?? "",
    status: params.get("status") ?? undefined,
    agent: params.get("agent") ?? undefined,
    method: params.get("method") ?? undefined,
    created: params.get("created") ?? undefined,
    sort: params.get("sort") ?? undefined,
    direction: params.get("direction") ?? undefined,
  });
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", "Those filters are not valid.");
  return apiOk(listDepositRecords(parsed.data));
}
