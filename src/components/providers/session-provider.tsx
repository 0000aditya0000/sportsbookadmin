"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef } from "react";
import type { Permission } from "@/config/permissions";
import { getSession, type SessionPayload } from "@/lib/api/auth";
import { ApiError, isSessionEndCode } from "@/lib/api/errors";

type SessionState =
  | { status: "loading" }
  | ({ status: "ready" } & SessionPayload);

const SessionContext = createContext<SessionState>({ status: "loading" });

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const ended = useRef(false);
  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => (await getSession()).data,
    retry: false,
  });

  useEffect(() => {
    const onEnd = (event: Event) => {
      if (ended.current) return;
      ended.current = true;
      const code = (event as CustomEvent<{ code: string }>).detail.code;
      const reason = code === "SESSION_REVOKED" ? "revoked" : "expired";
      queryClient.clear();
      router.replace(`/login?reason=${reason}`);
    };
    window.addEventListener("meridian:session-end", onEnd);
    return () => window.removeEventListener("meridian:session-end", onEnd);
  }, [queryClient, router]);

  useEffect(() => {
    if (query.error instanceof ApiError && isSessionEndCode(query.error.code)) {
      window.dispatchEvent(new CustomEvent("meridian:session-end", { detail: { code: query.error.code } }));
    }
  }, [query.error]);

  const value: SessionState = query.data ? { status: "ready", ...query.data } : { status: "loading" };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

export function usePermission(permission: Permission) {
  const session = useSession();
  if (session.status !== "ready") return false;
  return session.permissions.includes(permission);
}
