import "server-only";

import { randomBytes, timingSafeEqual } from "node:crypto";
import { deleteChallenge, saveChallenge, takeChallenge } from "@/mocks/services/session-registry";

const DEV_EMAIL = "ops@meridian.local";
const DEV_PASSWORD = "Meridian-Ops-2048";
const DEV_OTP = "739154";

function safeEqual(left: string, right: string): boolean {
  const actual = Buffer.from(left);
  const expected = Buffer.from(right);
  if (actual.length !== expected.length) {
    timingSafeEqual(actual, actual);
    return false;
  }
  return timingSafeEqual(actual, expected);
}

export function developmentLoginHint() {
  return {
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
    otp: DEV_OTP,
    note: "Development fixture only. This is not a production account.",
  };
}

export function startLogin(email: string, password: string): { ok: true; challengeId: string } | { ok: false } {
  const emailMatches = safeEqual(email.trim().toLowerCase(), DEV_EMAIL);
  const passwordMatches = safeEqual(password, DEV_PASSWORD);
  if (!emailMatches || !passwordMatches) return { ok: false };

  const challengeId = randomBytes(16).toString("hex");
  saveChallenge({
    id: challengeId,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
  });
  return { ok: true, challengeId };
}

export function verifyLoginCode(
  challengeId: string,
  code: string,
): { ok: true } | { ok: false; message: string } {
  const challenge = takeChallenge(challengeId);
  if (!challenge || challenge.expiresAt <= Date.now()) {
    deleteChallenge(challengeId);
    return { ok: false, message: "That sign-in attempt expired. Start again." };
  }

  challenge.attempts += 1;
  if (challenge.attempts > 5) {
    deleteChallenge(challengeId);
    return { ok: false, message: "Too many attempts. Start again." };
  }

  if (!safeEqual(code, DEV_OTP)) {
    return { ok: false, message: "That code is not valid." };
  }

  deleteChallenge(challengeId);
  return { ok: true };
}
