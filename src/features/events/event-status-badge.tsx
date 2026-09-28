import { StatusBadge } from "@/components/ui/status-badge";
import type { EventStatus } from "@/lib/validation/events";

const labels: Record<EventStatus, string> = {
  scheduled: "Scheduled",
  live: "Live",
  completed: "Completed",
  suspended: "Suspended",
  cancelled: "Cancelled",
  postponed: "Postponed",
};

const tones: Record<EventStatus, "success" | "warning" | "danger" | "info" | "neutral" | "live"> = {
  scheduled: "info",
  live: "live",
  completed: "success",
  suspended: "warning",
  cancelled: "danger",
  postponed: "neutral",
};

export function eventStatusLabel(status: EventStatus): string {
  return labels[status];
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <StatusBadge tone={tones[status]} pulse={status === "live"}>
      {labels[status]}
    </StatusBadge>
  );
}
