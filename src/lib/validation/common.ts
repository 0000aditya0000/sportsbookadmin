import { z } from "zod";
import { CURRENCY_CODES } from "@/lib/format";

export const moneySchema = z.object({
  amountMinor: z.number().int().safe(),
  currency: z.enum(CURRENCY_CODES),
});

export const pageQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  q: z.string().max(80).optional(),
});

export type PageQuery = z.infer<typeof pageQuerySchema>;
