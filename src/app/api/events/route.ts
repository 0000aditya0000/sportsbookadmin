import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { listEventRecords } from "@/mocks/services/event-service";
import { eventListQuerySchema } from "@/lib/validation/events";

export const dynamic = "force-dynamic";

function numberParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.EVENT_VIEW);
  if (!access.ok) return access.response;

  const params = new URL(request.url).searchParams;
  const parsed = eventListQuerySchema.safeParse({
    page: numberParam(params.get("page")),
    pageSize: numberParam(params.get("pageSize")),
    q: params.get("q") ?? "",
    sport: params.get("sport") ?? undefined,
    competition: params.get("competition") ?? undefined,
    status: params.get("status") ?? undefined,
    provider: params.get("provider") ?? undefined,
    start: params.get("start") ?? undefined,
    timing: params.get("timing") ?? undefined,
    sort: params.get("sort") ?? undefined,
    direction: params.get("direction") ?? undefined,
  });
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", "Those filters are not valid.");
  return apiOk(listEventRecords(parsed.data));
}
