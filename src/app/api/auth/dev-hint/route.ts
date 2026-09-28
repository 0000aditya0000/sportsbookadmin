import { apiFail, apiOk } from "@/lib/api/route-response";
import { developmentLoginHint } from "@/mocks/services/auth-service";

export const dynamic = "force-dynamic";

export function GET() {
  if (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_DATA_SOURCE === "live") {
    return apiFail(404, "NOT_FOUND", "Not available.");
  }
  return apiOk(developmentLoginHint());
}
