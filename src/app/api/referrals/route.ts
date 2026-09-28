import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { listReferralUsers } from "@/mocks/services/referral-service";
import { referralUserListQuerySchema } from "@/lib/validation/referrals";

export const dynamic = "force-dynamic";

function numberParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.REFERRAL_VIEW);
  if (!access.ok) return access.response;
  const params = new URL(request.url).searchParams;
  const parsed = referralUserListQuerySchema.safeParse({
    page: numberParam(params.get("page")),
    pageSize: numberParam(params.get("pageSize")),
    q: params.get("q") ?? "",
    referrer: params.get("referrer") ?? undefined,
    agent: params.get("agent") ?? undefined,
    level: params.get("level") ?? undefined,
    source: params.get("source") ?? undefined,
    status: params.get("status") ?? undefined,
    registered: params.get("registered") ?? undefined,
    sort: params.get("sort") ?? undefined,
    direction: params.get("direction") ?? undefined,
  });
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", "Those filters are not valid.");
  return apiOk(listReferralUsers(parsed.data));
}
