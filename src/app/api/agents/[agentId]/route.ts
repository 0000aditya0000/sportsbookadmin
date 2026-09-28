import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getAgentRecord, updateAgentRecord } from "@/mocks/services/agent-service";
import { agentIdSchema, updateAgentSchema } from "@/lib/validation/agents";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ agentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.AGENT_VIEW);
  if (!access.ok) return access.response;
  const { agentId } = await context.params;
  const id = agentIdSchema.safeParse(agentId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That agent was not found.");
  const agent = getAgentRecord(id.data);
  if (!agent.ok) return apiFail(404, agent.code, agent.message);
  return apiOk(agent.data);
}

export async function PATCH(request: Request, context: RouteContext) {
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
  const parsed = updateAgentSchema.safeParse(body);
  if (!parsed.success) {
    return apiFail(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Those details are not valid.");
  }
  const updated = updateAgentRecord(id.data, parsed.data);
  if (!updated.ok) {
    const status = updated.code === "NOT_FOUND" ? 404 : 409;
    return apiFail(status, updated.code, updated.message);
  }
  return apiOk(updated.data, "Agent profile saved.");
}
