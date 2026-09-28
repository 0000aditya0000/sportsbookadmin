import { apiFail, apiOk } from "@/lib/api/route-response";
import { loginSchema } from "@/lib/validation/auth";
import { startLogin } from "@/mocks/services/auth-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return apiFail(400, "VALIDATION_ERROR", "Enter the email and password.");
  }

  const result = startLogin(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return apiFail(401, "UNAUTHORIZED", "Email or password is incorrect.");
  }

  return apiOk({ step: "two_factor" as const, challengeId: result.challengeId });
}
