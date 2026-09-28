import { StatusBadge } from "@/components/ui/status-badge";
import type { SportListItem } from "@/lib/validation/sports";

type SportStatus = SportListItem["status"];

const labels: Record<SportStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

const tones: Record<SportStatus, "success" | "warning" | "neutral"> = {
  active: "success",
  inactive: "neutral",
  suspended: "warning",
};

export function SportStatusBadge({ status }: { status: SportStatus }) {
  return <StatusBadge tone={tones[status]}>{labels[status]}</StatusBadge>;
}
