import "server-only";

import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { can, permissionsForRole, type Permission } from "@/config/permissions";
import { readSession, type SessionRead } from "@/lib/auth/dal";

export function apiOk<T>(data: T, message?: string, status = 200) {
  const requestId = `req_${randomBytes(8).toString("hex")}`;
  return NextResponse.json(
    { success: true as const, data, message, requestId },
    {
      status,
      headers: {
        "cache-control": "no-store",
        "x-request-id": requestId,
      },
    },
  );
}

export function apiFail(status: number, code: string, message: string) {
  const requestId = `req_${randomBytes(8).toString("hex")}`;
  return NextResponse.json(
    { success: false as const, code, message, requestId },
    {
      status,
      headers: {
        "cache-control": "no-store",
        "x-request-id": requestId,
      },
    },
  );
}

export async function requireApiSession(permission?: Permission): Promise<
  | { ok: true; session: Extract<SessionRead, { status: "ok" }> }
  | { ok: false; response: NextResponse }
> {
  const session = await readSession();
  if (session.status === "revoked") {
    return { ok: false, response: apiFail(401, "SESSION_REVOKED", "This session was revoked.") };
  }
  if (session.status === "expired") {
    return { ok: false, response: apiFail(401, "SESSION_EXPIRED", "This session expired.") };
  }
  if (session.status !== "ok") {
    return { ok: false, response: apiFail(401, "UNAUTHORIZED", "Authentication required.") };
  }
  if (permission && !can(permissionsForRole(session.claims.role), permission)) {
    return {
      ok: false,
      response: apiFail(403, "FORBIDDEN", "You do not have access to this resource."),
    };
  }
  return { ok: true, session };
}
