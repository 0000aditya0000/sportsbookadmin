import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { searchPlatform } from "@/mocks/services/search-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await requireApiSession(PERMISSIONS.DASHBOARD_VIEW);
  if (!access.ok) return access.response;

  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (query.length > 80) {
    return apiFail(400, "VALIDATION_ERROR", "Search text is too long.");
  }

  return apiOk(searchPlatform(query));
}
