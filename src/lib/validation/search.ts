import { z } from "zod";

export const searchResultSchema = z.object({
  id: z.string(),
  type: z.enum([
    "user",
    "agent",
    "bet",
    "event",
    "sport",
    "wallet",
    "transaction",
    "withdrawal",
    "deposit",
    "session",
    "referral",
    "commission",
  ]),
  title: z.string(),
  subtitle: z.string(),
  href: z.string(),
});

export const searchResponseSchema = z.object({
  query: z.string(),
  results: z.array(searchResultSchema),
});

export type SearchResult = z.infer<typeof searchResultSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
