import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getDepositRecord } from "@/mocks/services/deposit-service";
import { depositIdSchema } from "@/lib/validation/deposits";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ depositId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.DEPOSIT_VIEW);
  if (!access.ok) return access.response;
  const { depositId } = await context.params;
  const id = depositIdSchema.safeParse(depositId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That deposit was not found.");
  const result = getDepositRecord(id.data);
  if (!result.ok) return apiFail(404, result.code, result.message);
  return apiOk(result.data);
}
