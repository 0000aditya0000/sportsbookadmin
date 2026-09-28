import { StatusBadge } from "@/components/ui/status-badge";
import type { UserStatus } from "@/lib/validation/users";

const labels: Record<UserStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  banned: "Banned",
  locked: "Locked",
};

const tones: Record<UserStatus, "success" | "warning" | "danger" | "info"> = {
  active: "success",
  suspended: "warning",
  banned: "danger",
  locked: "info",
};

export function userStatusLabel(status: UserStatus): string {
  return labels[status];
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <StatusBadge tone={tones[status]}>{labels[status]}</StatusBadge>;
}

const sessionLabels = {
  active: "Active",
  revoked: "Revoked",
  expired: "Expired",
} as const;

export function SessionStatusBadge({ status }: { status: keyof typeof sessionLabels }) {
  const tone = status === "active" ? "success" : status === "revoked" ? "danger" : "neutral";
  return <StatusBadge tone={tone}>{sessionLabels[status]}</StatusBadge>;
}
