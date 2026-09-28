import type { Money } from "@/lib/format";
import { apiFetch } from "@/lib/api/client";

export type ExposureSnapshot = {
  current: Money;
  generatedAt: string;
};

export function getExposure() {
  return apiFetch<ExposureSnapshot>("/api/risk/exposure");
}
