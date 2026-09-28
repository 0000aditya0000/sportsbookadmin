import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const claimsSchema = z.object({
  sid: z.string().min(8),
  sub: z.string().min(1),
  role: z.literal("SUPER_ADMIN"),
  iat: z.number().int(),
  exp: z.number().int(),
});

export type SessionClaims = z.infer<typeof claimsSchema>;

export type SessionVerification =
  | { ok: true; claims: SessionClaims }
  | { ok: false; reason: "invalid" | "expired" };

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

export function signSessionToken(claims: SessionClaims, secret: string): string {
  const body = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifySessionToken(token: string, secret: string): SessionVerification {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "invalid" };
  const [body, signature] = parts;
  if (!body || !signature) return { ok: false, reason: "invalid" };

  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return { ok: false, reason: "invalid" };
  }

  try {
    const parsed = claimsSchema.safeParse(JSON.parse(Buffer.from(body, "base64url").toString("utf8")));
    if (!parsed.success) return { ok: false, reason: "invalid" };
    if (parsed.data.exp * 1000 <= Date.now()) return { ok: false, reason: "expired" };
    return { ok: true, claims: parsed.data };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
