import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getAgentReferral } from "@/mocks/services/referral-service";
import { agentIdSchema } from "@/lib/validation/agents";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ agentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.REFERRAL_VIEW);
  if (!access.ok) return access.response;
  const { agentId } = await context.params;
  const id = agentIdSchema.safeParse(agentId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That agent referral network was not found.");
  const result = getAgentReferral(id.data);
  if (!result.ok) return apiFail(404, result.code, result.message);
  return apiOk(result.data);
}
