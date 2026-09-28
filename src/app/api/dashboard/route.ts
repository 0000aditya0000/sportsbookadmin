import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { dashboardQuerySchema } from "@/lib/validation/dashboard";
import { getDashboardSnapshot } from "@/mocks/services/dashboard-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.DASHBOARD_VIEW);
  if (!access.ok) return access.response;

  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "6");
  const parsed = dashboardQuerySchema.safeParse({
    range: params.get("range") ?? undefined,
    page: Number.isFinite(page) ? page : undefined,
    pageSize: Number.isFinite(pageSize) ? pageSize : undefined,
    q: params.get("q") ?? "",
    status: params.get("status") ?? undefined,
    sort: params.get("sort") ?? undefined,
    dir: params.get("dir") ?? undefined,
  });

  if (!parsed.success) {
    return apiFail(400, "VALIDATION_ERROR", "Those filters are not valid.");
  }

  return apiOk(getDashboardSnapshot(parsed.data));
}
