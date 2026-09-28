import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getReferralTree } from "@/mocks/services/referral-service";
import { referralTreeQuerySchema } from "@/lib/validation/referrals";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.REFERRAL_VIEW);
  if (!access.ok) return access.response;
  const params = new URL(request.url).searchParams;
  const parsed = referralTreeQuerySchema.safeParse({ userId: params.get("userId") ?? "" });
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", "Provide a valid user id.");
  const result = getReferralTree(parsed.data.userId);
  if (!result.ok) return apiFail(404, result.code, result.message);
  return apiOk(result.data);
}
