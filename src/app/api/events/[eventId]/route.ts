import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getEventRecord } from "@/mocks/services/event-service";
import { eventIdSchema } from "@/lib/validation/events";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.EVENT_VIEW);
  if (!access.ok) return access.response;
  const { eventId } = await context.params;
  const id = eventIdSchema.safeParse(eventId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That event was not found.");
  const event = getEventRecord(id.data);
  if (!event.ok) return apiFail(404, event.code, event.message);
  return apiOk(event.data);
}
