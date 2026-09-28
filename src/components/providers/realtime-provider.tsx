"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "@/components/providers/session-provider";
import { ConnectionManager } from "@/lib/websocket/connection-manager";
import { dispatchRealtimeEvent } from "@/lib/websocket/dispatcher";
import { createTransport } from "@/lib/websocket/transports";
import type { ConnectionSnapshot } from "@/lib/websocket/types";

const RealtimeContext = createContext<ConnectionSnapshot>({
  status: "idle",
  lastHeartbeatAt: null,
  transport: "mock",
  attempt: 0,
});

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const queryClient = useQueryClient();
  const [snapshot, setSnapshot] = useState<ConnectionSnapshot>({
    status: "idle",
    lastHeartbeatAt: null,
    transport: "mock",
    attempt: 0,
  });

  useEffect(() => {
    if (session.status !== "ready") return;
    const manager = new ConnectionManager({
      transport: createTransport(),
      onStatus: setSnapshot,
      onEvent: (event) => dispatchRealtimeEvent(event, queryClient),
    });
    manager.start();
    return () => manager.stop();
  }, [queryClient, session.status]);

  return <RealtimeContext.Provider value={snapshot}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
