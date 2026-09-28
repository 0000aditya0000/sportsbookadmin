import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getReferralReports } from "@/mocks/services/referral-service";
import { referralReportQuerySchema } from "@/lib/validation/referrals";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.REFERRAL_COMMISSION_VIEW);
  if (!access.ok) return access.response;
  const params = new URL(request.url).searchParams;
  const parsed = referralReportQuerySchema.safeParse({
    created: params.get("created") ?? undefined,
    agent: params.get("agent") ?? undefined,
    level: params.get("level") ?? undefined,
    status: params.get("status") ?? undefined,
  });
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", "Those filters are not valid.");
  return apiOk(getReferralReports(parsed.data));
}
