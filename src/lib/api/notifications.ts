import { apiFetch } from "@/lib/api/client";
import { notificationListSchema, type NotificationList } from "@/lib/validation/notifications";

export async function listNotifications(): Promise<NotificationList> {
  const result = await apiFetch<unknown>("/api/notifications");
  return notificationListSchema.parse(result.data);
}
