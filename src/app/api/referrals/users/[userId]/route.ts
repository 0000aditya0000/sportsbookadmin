import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getUserReferral } from "@/mocks/services/referral-service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.REFERRAL_VIEW);
  if (!access.ok) return access.response;
  const { userId } = await context.params;
  const result = getUserReferral(userId);
  if (!result.ok) return apiFail(404, result.code, result.message);
  return apiOk(result.data);
}
