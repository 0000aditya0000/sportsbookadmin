import { sessionProfile } from "@/lib/auth/dal";
import { apiOk, requireApiSession } from "@/lib/api/route-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiSession();
  if (!access.ok) return access.response;
  return apiOk(sessionProfile(access.session.claims));
}
