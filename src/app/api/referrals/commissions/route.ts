import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { listReferralCommissions } from "@/mocks/services/referral-service";
import { referralCommissionListQuerySchema } from "@/lib/validation/referrals";

export const dynamic = "force-dynamic";

function numberParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.REFERRAL_COMMISSION_VIEW);
  if (!access.ok) return access.response;
  const params = new URL(request.url).searchParams;
  const parsed = referralCommissionListQuerySchema.safeParse({
    page: numberParam(params.get("page")),
    pageSize: numberParam(params.get("pageSize")),
    q: params.get("q") ?? "",
    beneficiary: params.get("beneficiary") ?? undefined,
    betUser: params.get("betUser") ?? undefined,
    betId: params.get("betId") ?? "",
    level: params.get("level") ?? undefined,
    agent: params.get("agent") ?? undefined,
    status: params.get("status") ?? undefined,
    created: params.get("created") ?? undefined,
    sort: params.get("sort") ?? undefined,
    direction: params.get("direction") ?? undefined,
  });
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", "Those filters are not valid.");
  return apiOk(listReferralCommissions(parsed.data));
}
