import type { ConnectionSnapshot, RealtimeEvent, RealtimeTransport } from "@/lib/websocket/types";

const STALE_AFTER_MS = 45_000;

type ManagerOptions = {
  transport: RealtimeTransport;
  onStatus: (snapshot: ConnectionSnapshot) => void;
  onEvent: (event: RealtimeEvent) => void;
};

export class ConnectionManager {
  private readonly transport: RealtimeTransport;
  private readonly onStatus: ManagerOptions["onStatus"];
  private readonly onEvent: ManagerOptions["onEvent"];
  private disposed = false;
  private attempt = 0;
  private lastHeartbeatAt: number | null = null;
  private status: ConnectionSnapshot["status"] = "idle";
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private staleTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: ManagerOptions) {
    this.transport = options.transport;
    this.onStatus = options.onStatus;
    this.onEvent = options.onEvent;
  }

  start() {
    this.disposed = false;
    this.connect();
    this.staleTimer = setInterval(() => this.checkStale(), 5_000);
  }

  stop() {
    this.disposed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.staleTimer) clearInterval(this.staleTimer);
    this.transport.disconnect();
    this.publish("disconnected");
  }

  private connect() {
    if (this.disposed) return;
    this.publish(this.attempt === 0 ? "connecting" : "reconnecting");
    this.transport.disconnect();
    this.transport.connect({
      onOpen: () => {
        this.attempt = 0;
        this.lastHeartbeatAt = Date.now();
        this.publish("connected");
      },
      onHeartbeat: () => {
        this.lastHeartbeatAt = Date.now();
        if (this.status === "stale") this.publish("connected");
      },
      onEvent: (event) => this.onEvent(event),
      onClose: () => this.scheduleReconnect(),
    });
  }

  private scheduleReconnect() {
    if (this.disposed) return;
    this.publish("reconnecting");
    const delay = Math.min(15_000, 1_000 * 2 ** this.attempt);
    this.attempt += 1;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private checkStale() {
    if (this.status !== "connected" && this.status !== "stale") return;
    if (!this.lastHeartbeatAt) return;
    if (Date.now() - this.lastHeartbeatAt > STALE_AFTER_MS) this.publish("stale");
  }

  private publish(status: ConnectionSnapshot["status"]) {
    this.status = status;
    this.onStatus({
      status,
      lastHeartbeatAt: this.lastHeartbeatAt,
      transport: this.transport.kind,
      attempt: this.attempt,
    });
  }
}
