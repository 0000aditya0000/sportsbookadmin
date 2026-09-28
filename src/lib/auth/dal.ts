import "server-only";

import { cookies } from "next/headers";
import { permissionsForRole } from "@/config/permissions";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { getSessionSecret, verifySessionToken, type SessionClaims } from "@/lib/auth/session-token";
import { isSessionRevoked } from "@/mocks/services/session-registry";

export type AdminProfile = {
  id: string;
  displayName: string;
  email: string;
  role: "SUPER_ADMIN";
  twoFactorEnabled: true;
};

export type SessionRead =
  | { status: "ok"; claims: SessionClaims }
  | { status: "anonymous" }
  | { status: "expired" }
  | { status: "revoked" }
  | { status: "invalid" };

export const ADMIN_PROFILE: AdminProfile = {
  id: "SA-1001",
  displayName: "Operations Admin",
  email: "ops@meridian.local",
  role: "SUPER_ADMIN",
  twoFactorEnabled: true,
};

export async function readSession(): Promise<SessionRead> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return { status: "anonymous" };

  let secret: string;
  try {
    secret = getSessionSecret();
  } catch {
    return { status: "invalid" };
  }

  const verified = verifySessionToken(token, secret);
  if (!verified.ok) return { status: verified.reason };
  if (isSessionRevoked(verified.claims.sid)) return { status: "revoked" };
  return { status: "ok", claims: verified.claims };
}

export function sessionProfile(claims: SessionClaims) {
  return {
    admin: ADMIN_PROFILE,
    permissions: permissionsForRole(claims.role),
    sessionId: claims.sid,
    expiresAt: new Date(claims.exp * 1000).toISOString(),
  };
}
