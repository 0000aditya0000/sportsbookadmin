import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_PROFILE } from "@/lib/auth/dal";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { getSessionSecret, signSessionToken } from "@/lib/auth/session-token";
import { apiFail, apiOk } from "@/lib/api/route-response";
import { twoFactorSchema } from "@/lib/validation/auth";
import { verifyLoginCode } from "@/mocks/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = twoFactorSchema.safeParse(body);
  if (!parsed.success) {
    return apiFail(400, "VALIDATION_ERROR", "Enter the 6-digit code.");
  }

  const result = verifyLoginCode(parsed.data.challengeId, parsed.data.code);
  if (!result.ok) {
    return apiFail(401, "UNAUTHORIZED", result.message);
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const token = signSessionToken(
    {
      sid: `ses_${randomBytes(12).toString("hex")}`,
      sub: ADMIN_PROFILE.id,
      role: "SUPER_ADMIN",
      iat: issuedAt,
      exp: issuedAt + SESSION_MAX_AGE_SECONDS,
    },
    getSessionSecret(),
  );

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return apiOk({ authenticated: true as const }, "Session started.");
}
