import { PERMISSIONS } from "@/config/permissions";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { getUserRecord } from "@/mocks/services/user-service";
import { userIdSchema } from "@/lib/validation/users";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.USER_VIEW);
  if (!access.ok) return access.response;
  const { userId } = await context.params;
  const id = userIdSchema.safeParse(userId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That user was not found.");
  const user = getUserRecord(id.data);
  if (!user.ok) return apiFail(404, user.code, user.message);
  return apiOk(user.data);
}
