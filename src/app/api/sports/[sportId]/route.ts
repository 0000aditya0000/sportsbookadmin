import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getSportRecord } from "@/mocks/services/sport-service";
import { sportIdSchema } from "@/lib/validation/sports";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ sportId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.SPORT_VIEW);
  if (!access.ok) return access.response;
  const { sportId } = await context.params;
  const id = sportIdSchema.safeParse(sportId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That sport was not found.");
  const sport = getSportRecord(id.data);
  if (!sport.ok) return apiFail(404, sport.code, sport.message);
  return apiOk(sport.data);
}
