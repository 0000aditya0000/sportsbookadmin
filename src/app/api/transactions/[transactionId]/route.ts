import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getTransactionRecord } from "@/mocks/services/transaction-service";
import { transactionIdSchema } from "@/lib/validation/transactions";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ transactionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.TRANSACTION_VIEW);
  if (!access.ok) return access.response;
  const { transactionId } = await context.params;
  const id = transactionIdSchema.safeParse(transactionId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That transaction was not found.");
  const result = getTransactionRecord(id.data);
  if (!result.ok) return apiFail(404, result.code, result.message);
  return apiOk(result.data);
}
