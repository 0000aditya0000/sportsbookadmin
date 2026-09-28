import { realtimeEventSchema, type RealtimeTransport, type TransportHandlers } from "@/lib/websocket/types";

export class MockRealtimeTransport implements RealtimeTransport {
  readonly kind = "mock" as const;
  private heartbeat: ReturnType<typeof setInterval> | null = null;

  connect(handlers: TransportHandlers) {
    queueMicrotask(() => handlers.onOpen());
    this.heartbeat = setInterval(() => handlers.onHeartbeat(), 15_000);
  }

  disconnect() {
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.heartbeat = null;
  }
}

export class BrowserWebSocketTransport implements RealtimeTransport {
  readonly kind = "websocket" as const;
  private socket: WebSocket | null = null;
  private closing = false;

  constructor(private readonly url: string) {}

  connect(handlers: TransportHandlers) {
    const socket = new WebSocket(this.url);
    this.socket = socket;
    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ type: "AUTH" }));
      handlers.onOpen();
    });
    socket.addEventListener("close", () => {
      if (this.closing) {
        this.closing = false;
        return;
      }
      handlers.onClose();
    });
    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;
      try {
        const parsed = JSON.parse(event.data) as unknown;
        if (parsed && typeof parsed === "object" && "type" in parsed && parsed.type === "HEARTBEAT") {
          handlers.onHeartbeat();
          return;
        }
        const message = realtimeEventSchema.safeParse(parsed);
        if (message.success) {
          handlers.onHeartbeat();
          handlers.onEvent(message.data);
        }
      } catch {
        return;
      }
    });
  }

  disconnect() {
    if (!this.socket) return;
    this.closing = true;
    this.socket.close();
    this.socket = null;
  }
}

export function createTransport(): RealtimeTransport {
  const url = process.env.NEXT_PUBLIC_WS_URL;
  if (url) return new BrowserWebSocketTransport(url);
  return new MockRealtimeTransport();
}
