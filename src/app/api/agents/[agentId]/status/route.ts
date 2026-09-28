import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { changeAgentStatus } from "@/mocks/services/agent-service";
import { agentIdSchema, agentStatusChangeSchema } from "@/lib/validation/agents";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ agentId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.AGENT_EDIT);
  if (!access.ok) return access.response;
  const { agentId } = await context.params;
  const id = agentIdSchema.safeParse(agentId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That agent was not found.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiFail(400, "VALIDATION_ERROR", "The request body could not be read.");
  }
  const parsed = agentStatusChangeSchema.safeParse(body);
  if (!parsed.success) {
    return apiFail(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "That status change is not valid.");
  }
  const updated = changeAgentStatus(id.data, parsed.data);
  if (!updated.ok) {
    const status = updated.code === "NOT_FOUND" ? 404 : 409;
    return apiFail(status, updated.code, updated.message);
  }
  const message = parsed.data.action === "suspend" ? "Suspension submitted." : "Activation submitted.";
  return apiOk(updated.data, message);
}
