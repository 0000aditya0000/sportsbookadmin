import type { QueryClient } from "@tanstack/react-query";
import type { RealtimeEvent } from "@/lib/websocket/types";

export function dispatchRealtimeEvent(event: RealtimeEvent, queryClient: QueryClient) {
  switch (event.type) {
    case "NOTIFICATION_CREATED":
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      return;
    case "USER_UPDATED":
    case "USER_STATUS_CHANGED":
    case "USER_SESSION_CHANGED":
    case "USER_WALLET_UPDATED":
    case "USER_BET_UPDATED":
    case "USER_TRANSACTION_UPDATED":
    case "USER_ACTIVITY_CREATED":
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["user", event.userId] });
      if (event.type === "USER_WALLET_UPDATED") {
        void queryClient.invalidateQueries({ queryKey: ["wallet"] });
        void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      }
      return;
    case "WALLET_UPDATED":
    case "WALLET_STATUS_CHANGED":
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      void queryClient.invalidateQueries({ queryKey: ["user"] });
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
      void queryClient.invalidateQueries({ queryKey: ["agent"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      return;
    case "EVENT_UPDATED":
    case "EVENT_STATUS_CHANGED":
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      void queryClient.invalidateQueries({ queryKey: ["event", event.eventId] });
      void queryClient.invalidateQueries({ queryKey: ["sports"] });
      void queryClient.invalidateQueries({ queryKey: ["sport"] });
      return;
    case "BET_UPDATED":
    case "ODDS_UPDATED":
    case "MARKET_SUSPENDED":
    case "PROVIDER_STATUS_CHANGED":
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      return;
    case "WITHDRAWAL_UPDATED":
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      void queryClient.invalidateQueries({ queryKey: ["withdrawal", event.withdrawalId] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      return;
    case "DEPOSIT_UPDATED":
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["deposits"] });
      void queryClient.invalidateQueries({ queryKey: ["deposit", event.depositId] });
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
      return;
    case "REFERRAL_COMMISSION_POSTED":
      void queryClient.invalidateQueries({ queryKey: ["referrals"] });
      void queryClient.invalidateQueries({ queryKey: ["referral-commissions"] });
      void queryClient.invalidateQueries({ queryKey: ["referral-commission", event.commissionId] });
      void queryClient.invalidateQueries({ queryKey: ["referral-config"] });
      void queryClient.invalidateQueries({ queryKey: ["referral-reports"] });
      void queryClient.invalidateQueries({ queryKey: ["user-referral"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-referral"] });
      return;
    default: {
      const unreachable: never = event;
      return unreachable;
    }
  }
}
