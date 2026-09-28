import { PERMISSIONS } from "@/config/permissions";
import { ADMIN_PROFILE } from "@/lib/auth/dal";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { revokeUserSession } from "@/mocks/services/user-service";
import { userIdSchema, userSessionIdSchema } from "@/lib/validation/users";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ userId: string; sessionId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const access = await requireApiSession(PERMISSIONS.USER_SESSION_REVOKE);
  if (!access.ok) return access.response;
  const { userId, sessionId } = await context.params;
  const id = userIdSchema.safeParse(userId);
  const session = userSessionIdSchema.safeParse(sessionId);
  if (!id.success || !session.success) return apiFail(404, "NOT_FOUND", "That session was not found.");

  const revoked = revokeUserSession(id.data, session.data, ADMIN_PROFILE.displayName);
  if (!revoked.ok) {
    const status = revoked.code === "NOT_FOUND" ? 404 : 409;
    return apiFail(status, revoked.code, revoked.message);
  }
  return apiOk(revoked.data, "Session revoked successfully.");
}
