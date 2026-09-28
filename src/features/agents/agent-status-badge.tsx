import { StatusBadge } from "@/components/ui/status-badge";
import type { AgentStatus } from "@/lib/validation/agents";

const tones = {
  active: "success",
  suspended: "danger",
  pending: "warning",
  inactive: "neutral",
} as const;

const labels = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
  inactive: "Inactive",
} as const;

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  return <StatusBadge tone={tones[status]}>{labels[status]}</StatusBadge>;
}

export function agentStatusLabel(status: AgentStatus): string {
  return labels[status];
}
