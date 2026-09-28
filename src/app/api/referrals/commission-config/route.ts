import { can, permissionsForRole, PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getCommissionConfig, updateCommissionConfig } from "@/mocks/services/referral-service";
import { commissionConfigUpdateSchema } from "@/lib/validation/referrals";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession(PERMISSIONS.REFERRAL_CONFIG_VIEW);
  if (!access.ok) return access.response;
  return apiOk(getCommissionConfig());
}

export async function PUT(request: Request) {
  const access = await requireApiSession(PERMISSIONS.REFERRAL_CONFIG_VIEW);
  if (!access.ok) return access.response;
  if (!can(permissionsForRole(access.session.claims.role), PERMISSIONS.REFERRAL_CONFIG_UPDATE)) {
    return apiFail(403, "FORBIDDEN", "You do not have access to that action.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiFail(400, "VALIDATION_ERROR", "The request body is not valid JSON.");
  }
  const parsed = commissionConfigUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiFail(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid request.");
  }

  const result = updateCommissionConfig(parsed.data);
  if (!result.ok) {
    const status = result.code === "NOT_FOUND" ? 404 : 400;
    return apiFail(status, result.code, result.message);
  }
  return apiOk(result.data);
}
