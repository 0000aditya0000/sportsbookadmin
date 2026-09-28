import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { listSportRecords } from "@/mocks/services/sport-service";
import { sportListQuerySchema } from "@/lib/validation/sports";

export const dynamic = "force-dynamic";

function numberParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.SPORT_VIEW);
  if (!access.ok) return access.response;

  const params = new URL(request.url).searchParams;
  const parsed = sportListQuerySchema.safeParse({
    page: numberParam(params.get("page")),
    pageSize: numberParam(params.get("pageSize")),
    q: params.get("q") ?? "",
    status: params.get("status") ?? undefined,
    provider: params.get("provider") ?? undefined,
    activity: params.get("activity") ?? undefined,
    updated: params.get("updated") ?? undefined,
    sort: params.get("sort") ?? undefined,
    direction: params.get("direction") ?? undefined,
  });
  if (!parsed.success) return apiFail(400, "VALIDATION_ERROR", "Those filters are not valid.");
  return apiOk(listSportRecords(parsed.data));
}
