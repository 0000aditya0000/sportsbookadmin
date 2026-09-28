import type { ApiEnvelope } from "@/types/api";
import { ApiError, isSessionEndCode } from "@/lib/api/errors";

export type ApiResult<T> = {
  data: T;
  requestId?: string;
  message?: string;
};

function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
}

function notifySessionEnd(code: string) {
  if (typeof window === "undefined") return;
  if (!isSessionEndCode(code)) return;
  if (window.location.pathname === "/login") return;
  window.dispatchEvent(new CustomEvent("meridian:session-end", { detail: { code } }));
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const url = `${apiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("The network request failed.", { code: "NETWORK", status: 0 });
  }

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiError("The server returned an unreadable response.", {
      code: "INVALID_RESPONSE",
      status: response.status,
    });
  }

  if (!body || body.success !== true) {
    const code = body && body.success === false ? body.code : "REQUEST_FAILED";
    const message = body && body.success === false ? body.message : "The request failed.";
    const requestId = body && "requestId" in body ? body.requestId : undefined;
    notifySessionEnd(code);
    throw new ApiError(message, { code, status: response.status, requestId });
  }

  return { data: body.data, requestId: body.requestId, message: body.message };
}
