import { can, permissionsForRole, PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { changeDepositStatus } from "@/mocks/services/deposit-service";
import { depositIdSchema, depositStatusChangeSchema } from "@/lib/validation/deposits";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ depositId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.DEPOSIT_VIEW);
  if (!access.ok) return access.response;
  const { depositId } = await context.params;
  const id = depositIdSchema.safeParse(depositId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That deposit was not found.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiFail(400, "VALIDATION_ERROR", "The request body is not valid JSON.");
  }
  const parsed = depositStatusChangeSchema.safeParse(body);
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid request.");

  const permission = parsed.data.action === "reject" ? PERMISSIONS.DEPOSIT_REJECT : PERMISSIONS.DEPOSIT_APPROVE;
  if (!can(permissionsForRole(access.session.claims.role), permission)) {
    return apiFail(403, "FORBIDDEN", "You do not have access to that action.");
  }

  const result = changeDepositStatus(id.data, parsed.data);
  if (!result.ok) {
    const status = result.code === "NOT_FOUND" ? 404 : 409;
    return apiFail(status, result.code, result.message);
  }
  return apiOk(result.data);
}
