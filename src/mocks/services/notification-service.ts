import "server-only";

import { notifications } from "@/mocks/data/notifications";
import { notificationListSchema, type NotificationList } from "@/lib/validation/notifications";

export function listNotifications(): NotificationList {
  return notificationListSchema.parse({ items: notifications.map((item) => ({ ...item })) });
}
