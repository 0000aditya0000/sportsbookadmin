import { z } from "zod";

export const realtimeEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("BET_UPDATED"), betId: z.string() }),
  z.object({ type: z.literal("ODDS_UPDATED"), eventId: z.string(), marketId: z.string() }),
  z.object({ type: z.literal("MARKET_SUSPENDED"), marketId: z.string() }),
  z.object({ type: z.literal("EVENT_UPDATED"), eventId: z.string() }),
  z.object({ type: z.literal("EVENT_STATUS_CHANGED"), eventId: z.string(), status: z.string() }),
  z.object({ type: z.literal("PROVIDER_STATUS_CHANGED"), status: z.string() }),
  z.object({ type: z.literal("WITHDRAWAL_UPDATED"), withdrawalId: z.string() }),
  z.object({ type: z.literal("DEPOSIT_UPDATED"), depositId: z.string() }),
  z.object({ type: z.literal("REFERRAL_COMMISSION_POSTED"), commissionId: z.string() }),
  z.object({ type: z.literal("NOTIFICATION_CREATED"), notificationId: z.string() }),
  z.object({ type: z.literal("USER_UPDATED"), userId: z.string() }),
  z.object({ type: z.literal("USER_STATUS_CHANGED"), userId: z.string() }),
  z.object({ type: z.literal("USER_SESSION_CHANGED"), userId: z.string() }),
  z.object({ type: z.literal("USER_WALLET_UPDATED"), userId: z.string() }),
  z.object({ type: z.literal("USER_BET_UPDATED"), userId: z.string() }),
  z.object({ type: z.literal("USER_TRANSACTION_UPDATED"), userId: z.string() }),
  z.object({ type: z.literal("USER_ACTIVITY_CREATED"), userId: z.string() }),
  z.object({ type: z.literal("WALLET_UPDATED"), walletId: z.string() }),
  z.object({ type: z.literal("WALLET_STATUS_CHANGED"), walletId: z.string(), status: z.string() }),
]);

export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "stale";

export type ConnectionSnapshot = {
  status: ConnectionStatus;
  lastHeartbeatAt: number | null;
  transport: "mock" | "websocket";
  attempt: number;
};

export type TransportHandlers = {
  onOpen: () => void;
  onClose: () => void;
  onHeartbeat: () => void;
  onEvent: (event: RealtimeEvent) => void;
};

export interface RealtimeTransport {
  readonly kind: ConnectionSnapshot["transport"];
  connect: (handlers: TransportHandlers) => void;
  disconnect: () => void;
}
