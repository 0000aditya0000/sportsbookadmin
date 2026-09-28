import "server-only";

import { searchIndex } from "@/mocks/data/search";
import { agentSearchHits } from "@/mocks/services/agent-service";
import { depositSearchHits } from "@/mocks/services/deposit-service";
import { eventSearchHits } from "@/mocks/services/event-service";
import { referralSearchHits } from "@/mocks/services/referral-service";
import { sportSearchHits } from "@/mocks/services/sport-service";
import { transactionSearchHits } from "@/mocks/services/transaction-service";
import { userSearchHits } from "@/mocks/services/user-service";
import { walletSearchHits } from "@/mocks/services/wallet-service";
import { withdrawalSearchHits } from "@/mocks/services/withdrawal-service";
import { searchResponseSchema, type SearchResponse } from "@/lib/validation/search";

const suggestions = ["27411", "BET-88421", "AG-1042", "WD-19022", "EVT-IND-AUS", "WLT-USER-27411", "REF-ADITYA", "RC-70002"];

export function searchPlatform(query: string): SearchResponse {
  const needle = query.trim().toLowerCase();
  const index = [
    ...userSearchHits(),
    ...agentSearchHits(),
    ...sportSearchHits(),
    ...eventSearchHits(),
    ...walletSearchHits(),
    ...transactionSearchHits(),
    ...depositSearchHits(),
    ...withdrawalSearchHits(),
    ...referralSearchHits(),
    ...searchIndex.filter(
      (item) =>
        item.type !== "agent" &&
        item.type !== "user" &&
        item.type !== "event" &&
        item.type !== "sport" &&
        item.type !== "wallet" &&
        item.type !== "transaction" &&
        item.type !== "deposit" &&
        item.type !== "withdrawal" &&
        item.type !== "referral" &&
        item.type !== "commission",
    ),
  ];
  const results =
    needle.length === 0
      ? index.filter((item) => suggestions.includes(item.id))
      : index.filter((item) =>
          `${item.id} ${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(needle),
        );

  return searchResponseSchema.parse({ query: query.trim(), results });
}
