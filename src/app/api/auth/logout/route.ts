import { cookies } from "next/headers";
import { readSession } from "@/lib/auth/dal";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { apiOk } from "@/lib/api/route-response";
import { revokeSession } from "@/mocks/services/session-registry";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await readSession();
  if (session.status === "ok") revokeSession(session.claims.sid);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return apiOk({ ended: true as const }, "Session ended.");
}
