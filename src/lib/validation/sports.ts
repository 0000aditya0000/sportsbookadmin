import { z } from "zod";

export const sportStatusSchema = z.enum(["active", "inactive", "suspended"]);

export const sportListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: sportStatusSchema,
  providerId: z.string(),
  providerName: z.string(),
  competitions: z.number().int().nonnegative(),
  upcomingEvents: z.number().int().nonnegative(),
  liveEvents: z.number().int().nonnegative(),
  totalEvents: z.number().int().nonnegative(),
  lastUpdated: z.string(),
});

export const sportSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  competitions: z.number().int().nonnegative(),
  upcomingEvents: z.number().int().nonnegative(),
  liveEvents: z.number().int().nonnegative(),
  suspendedEvents: z.number().int().nonnegative(),
});

export const sportListQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  q: z.string().max(80).default(""),
  status: z.enum(["all", "active", "inactive", "suspended"]).default("all"),
  provider: z.string().default("all"),
  activity: z.enum(["all", "live", "quiet"]).default("all"),
  updated: z.enum(["all", "7d", "30d", "90d"]).default("all"),
  sort: z.enum(["name", "competitions", "upcomingEvents", "liveEvents", "totalEvents", "lastUpdated"]).default("liveEvents"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const sportListResponseSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  summary: sportSummarySchema,
  providers: z.array(z.object({ id: z.string(), name: z.string() })),
  items: z.array(sportListItemSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

const competitionSchema = z.object({
  id: z.string(),
  sportId: z.string(),
  name: z.string(),
  region: z.string(),
  status: sportStatusSchema,
  providerId: z.string(),
  providerName: z.string(),
  eventCount: z.number().int().nonnegative(),
  upcomingEventCount: z.number().int().nonnegative(),
  liveEventCount: z.number().int().nonnegative(),
  lastUpdated: z.string(),
});

const activitySchema = z.object({
  id: z.string(),
  action: z.string(),
  title: z.string(),
  detail: z.string(),
  at: z.string(),
});

export const sportDetailSchema = z.object({
  source: z.literal("mock"),
  generatedAt: z.string(),
  sport: sportListItemSchema.extend({
    configuredAt: z.string(),
  }),
  competitions: z.array(competitionSchema),
  events: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      competitionId: z.string(),
      competitionName: z.string(),
      status: z.enum(["scheduled", "live", "completed", "suspended", "cancelled", "postponed"]),
      startTime: z.string(),
      providerName: z.string(),
    }),
  ),
  activity: z.array(activitySchema),
});

export const sportIdSchema = z.string().regex(/^SPORT-[A-Z]+$/);

export type SportListItem = z.infer<typeof sportListItemSchema>;
export type SportListQuery = z.infer<typeof sportListQuerySchema>;
export type SportListResponse = z.infer<typeof sportListResponseSchema>;
export type SportDetail = z.infer<typeof sportDetailSchema>;
export type CompetitionView = z.infer<typeof competitionSchema>;
