import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { createAgentRecord, listAgentRecords } from "@/mocks/services/agent-service";
import { agentListQuerySchema, createAgentSchema } from "@/lib/validation/agents";

export const dynamic = "force-dynamic";

function numberParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.AGENT_VIEW);
  if (!access.ok) return access.response;

  const params = new URL(request.url).searchParams;
  const parsed = agentListQuerySchema.safeParse({
    page: numberParam(params.get("page")),
    pageSize: numberParam(params.get("pageSize")),
    q: params.get("q") ?? "",
    status: params.get("status") ?? undefined,
    created: params.get("created") ?? undefined,
    balance: params.get("balance") ?? undefined,
    performance: params.get("performance") ?? undefined,
    activity: params.get("activity") ?? undefined,
    sort: params.get("sort") ?? undefined,
    direction: params.get("direction") ?? undefined,
  });
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", "Those filters are not valid.");
  return apiOk(listAgentRecords(parsed.data));
}

export async function POST(request: Request) {
  const access = await requireApiSession(PERMISSIONS.AGENT_CREATE);
  if (!access.ok) return access.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiFail(400, "VALIDATION_ERROR", "The request body could not be read.");
  }
  const parsed = createAgentSchema.safeParse(body);
  if (!parsed.success) {
    return apiFail(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Those details are not valid.");
  }
  const created = createAgentRecord(parsed.data);
  if (!created.ok) return apiFail(409, created.code, created.message);
  return apiOk(created.data, "Agent submitted.", 201);
}
