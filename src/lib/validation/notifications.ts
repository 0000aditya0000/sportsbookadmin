import { z } from "zod";

export const notificationSchema = z.object({
  id: z.string(),
  severity: z.enum(["info", "warning", "critical"]),
  title: z.string(),
  body: z.string(),
  at: z.string(),
  reference: z.string().nullable(),
});

export const notificationListSchema = z.object({
  items: z.array(notificationSchema),
});

export type AppNotification = z.infer<typeof notificationSchema>;
export type NotificationList = z.infer<typeof notificationListSchema>;
