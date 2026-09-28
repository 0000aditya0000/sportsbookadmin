import { PERMISSIONS } from "@/config/permissions";
import { apiOk, requireApiSession } from "@/lib/api/route-response";
import { listNotifications } from "@/mocks/services/notification-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession(PERMISSIONS.DASHBOARD_VIEW);
  if (!access.ok) return access.response;
  return apiOk(listNotifications());
}
