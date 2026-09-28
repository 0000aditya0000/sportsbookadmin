import { expect, test } from "vitest";
import { signSessionToken, verifySessionToken, type SessionClaims } from "@/lib/auth/session-token";

const secret = "test-secret-test-secret-test-secret";

function claims(overrides?: Partial<SessionClaims>): SessionClaims {
  return {
    sid: "sid_12345678",
    sub: "SA-1001",
    role: "SUPER_ADMIN",
    iat: 1_700_000_000,
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

test("round-trips a signed session", () => {
  const token = signSessionToken(claims(), secret);
  const verified = verifySessionToken(token, secret);
  expect(verified.ok).toBe(true);
  if (verified.ok) expect(verified.claims.sub).toBe("SA-1001");
});

test("rejects a tampered signature and an expired token", () => {
  const token = signSessionToken(claims(), secret);
  const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
  expect(verifySessionToken(tampered, secret)).toEqual({ ok: false, reason: "invalid" });

  const expired = signSessionToken(claims({ exp: Math.floor(Date.now() / 1000) - 10 }), secret);
  expect(verifySessionToken(expired, secret)).toEqual({ ok: false, reason: "expired" });
});
