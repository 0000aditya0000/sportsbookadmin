import { apiFetch } from "@/lib/api/client";

export type ProviderMonitor = {
  name: string;
  kind: "dummy" | "third_party";
  status: "connected" | "degraded" | "down";
  latencyMs: number;
  lastSuccessAt: string | null;
  lastError: string | null;
};

export function getProviderMonitor() {
  return apiFetch<ProviderMonitor>("/api/system/providers");
}

export function getSystemHealth() {
  return apiFetch<{ services: { name: string; status: "healthy" | "degraded" | "down" }[] }>(
    "/api/system/health",
  );
}
