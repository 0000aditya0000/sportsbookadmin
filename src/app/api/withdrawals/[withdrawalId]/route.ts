import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getWithdrawalRecord } from "@/mocks/services/withdrawal-service";
import { withdrawalIdSchema } from "@/lib/validation/withdrawals";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ withdrawalId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.WITHDRAWAL_VIEW);
  if (!access.ok) return access.response;
  const { withdrawalId } = await context.params;
  const id = withdrawalIdSchema.safeParse(withdrawalId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That withdrawal was not found.");
  const result = getWithdrawalRecord(id.data);
  if (!result.ok) return apiFail(404, result.code, result.message);
  return apiOk(result.data);
}
