import { z } from "zod";

export const eventStatusSchema = z.enum([
  "scheduled",
  "live",
  "completed",
  "suspended",
  "cancelled",
  "postponed",
]);

export const participantSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string(),
  role: z.enum(["home", "away", "participant"]),
});

export const eventListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sportId: z.string(),
  sportName: z.string(),
  competitionId: z.string(),
  competitionName: z.string(),
  status: eventStatusSchema,
  startTime: z.string(),
  providerId: z.string(),
  providerName: z.string(),
  providerEventId: z.string(),
  lastUpdated: z.string(),
});

export const eventSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  upcoming: z.number().int().nonnegative(),
  live: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  suspended: z.number().int().nonnegative(),
});

export const eventListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().max(80).default(""),
  sport: z.string().default("all"),
  competition: z.string().default("all"),
  status: z.enum(["all", "scheduled", "live", "completed", "suspended", "cancelled", "postponed"]).default("all"),
  provider: z.string().default("all"),
  start: z.enum(["all", "today", "7d", "30d"]).default("all"),
  timing: z.enum(["all", "live", "upcoming"]).default("all"),
  sort: z.enum(["startTime", "name", "competition", "status", "lastUpdated"]).default("startTime"),
  direction: z.enum(["asc", "desc"]).default("asc"),
});

export const eventListResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  summary: eventSummarySchema,
  sports: z.array(z.object({ id: z.string(), name: z.string() })),
  competitions: z.array(z.object({ id: z.string(), name: z.string(), sportId: z.string() })),
  providers: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(eventListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

const activitySchema = z.object({
  id: z.string(),
  action: z.string(),
  title: z.string(),
  detail: z.string(),
  at: z.string(),
});

export const eventDetailSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  event: eventListItemSchema,
  participants: z.array(participantSchema),
  provider: z.object({
    id: z.string(),
    name: z.string(),
    eventId: z.string(),
    status: z.string(),
    lastUpdated: z.string(),
  }),
  activity: z.array(activitySchema),
  markets: z.object({
    available: z.literal(false),
    message: z.string(),
  }),
});

export const eventIdSchema = z.string().regex(/^EVT-[A-Z0-9-]+$/);

export type EventListItem = z.infer<typeof eventListItemSchema>;
export type EventListQuery = z.infer<typeof eventListQuerySchema>;
export type EventListResponse = z.infer<typeof eventListResponseSchema>;
export type EventDetail = z.infer<typeof eventDetailSchema>;
export type EventStatus = z.infer<typeof eventStatusSchema>;
