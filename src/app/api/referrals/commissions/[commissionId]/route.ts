import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getReferralCommission } from "@/mocks/services/referral-service";
import { commissionIdSchema } from "@/lib/validation/referrals";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ commissionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.REFERRAL_COMMISSION_VIEW);
  if (!access.ok) return access.response;
  const { commissionId } = await context.params;
  const id = commissionIdSchema.safeParse(commissionId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That commission was not found.");
  const result = getReferralCommission(id.data);
  if (!result.ok) return apiFail(404, result.code, result.message);
  return apiOk(result.data);
}
