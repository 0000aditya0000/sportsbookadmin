import { apiFetch } from "@/lib/api/client";
import type { Permission } from "@/config/permissions";

export type SessionPayload = {
  admin: {
    id: string;
    displayName: string;
    email: string;
    role: "SUPER_ADMIN";
    twoFactorEnabled: true;
  };
  permissions: Permission[];
  sessionId: string;
  expiresAt: string;
};

export type DevLoginHint = {
  email: string;
  password: string;
  otp: string;
  note: string;
};

export function login(input: { email: string; password: string }) {
  return apiFetch<{ step: "two_factor"; challengeId: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyTwoFactor(input: { challengeId: string; code: string }) {
  return apiFetch<{ authenticated: true }>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logout() {
  return apiFetch<{ ended: true }>("/api/auth/logout", { method: "POST" });
}

export function getSession() {
  return apiFetch<SessionPayload>("/api/auth/session");
}

export function getDevLoginHint() {
  return apiFetch<DevLoginHint>("/api/auth/dev-hint");
}
