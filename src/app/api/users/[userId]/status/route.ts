import { can, permissionsForRole, PERMISSIONS } from "@/config/permissions";
import { ADMIN_PROFILE } from "@/lib/auth/dal";
import { apiFail, apiOk, requireApiSession } from "@/lib/api/route-response";
import { changeUserStatus } from "@/mocks/services/user-service";
import { userIdSchema, userStatusChangeSchema } from "@/lib/validation/users";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ userId: string }> };

const messages = {
  suspend: "User suspended successfully.",
  activate: "User activated successfully.",
  ban: "User banned successfully.",
  unlock: "User unlocked successfully.",
} as const;

export async function POST(request: Request, context: RouteContext) {
  const access = await requireApiSession();
  if (!access.ok) return access.response;
  const { userId } = await context.params;
  const id = userIdSchema.safeParse(userId);
  if (!id.success) return apiFail(404, "NOT_FOUND", "That user was not found.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiFail(400, "VALIDATION_ERROR", "The request body could not be read.");
  }
  const parsed = userStatusChangeSchema.safeParse(body);
  if (!parsed.success) {
    return apiFail(400, "VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "That status change is not valid.");
  }

  const permission = parsed.data.action === "ban" ? PERMISSIONS.USER_BAN : PERMISSIONS.USER_SUSPEND;
  if (!can(permissionsForRole(access.session.claims.role), permission)) {
    return apiFail(403, "FORBIDDEN", "You do not have access to this resource.");
  }

  const updated = changeUserStatus(id.data, parsed.data, ADMIN_PROFILE.displayName);
  if (!updated.ok) {
    const status = updated.code === "NOT_FOUND" ? 404 : 409;
    return apiFail(status, updated.code, updated.message);
  }
  return apiOk(updated.data, messages[parsed.data.action]);
}
