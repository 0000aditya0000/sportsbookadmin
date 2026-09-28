import { can, permissionsForRole, PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { changeWithdrawalStatus } from "@/mocks/services/withdrawal-service";
import { withdrawalIdSchema, withdrawalStatusChangeSchema } from "@/lib/validation/withdrawals";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ withdrawalId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.WITHDRAWAL_VIEW);
  if (!access.ok) return access.response;
  const { withdrawalId } = await context.params;
  const id = withdrawalIdSchema.safeParse(withdrawalId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That withdrawal was not found.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiFail(400, "VALIDATION_ERROR", "The request body is not valid JSON.");
  }
  const parsed = withdrawalStatusChangeSchema.safeParse(body);
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid request.");

  const permission =
    parsed.data.action === "reject" ? PERMISSIONS.WITHDRAWAL_REJECT : PERMISSIONS.WITHDRAWAL_APPROVE;
  if (!can(permissionsForRole(access.session.claims.role), permission)) {
    return apiFail(403, "FORBIDDEN", "You do not have access to that action.");
  }

  const result = changeWithdrawalStatus(id.data, parsed.data);
  if (!result.ok) {
    const status = result.code === "NOT_FOUND" ? 404 : 409;
    return apiFail(status, result.code, result.message);
  }
  return apiOk(result.data);
}
