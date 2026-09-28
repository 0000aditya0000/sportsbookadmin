import { StatusBadge } from "@/components/ui/status-badge";
import type { CommissionStatus, ReferralUserStatus } from "@/lib/validation/referrals";

export function ReferralUserStatusBadge({ status }: { status: ReferralUserStatus }) {
  const tone =
    status === "active" ? "success" : status === "suspended" || status === "locked" ? "warning" : "danger";
  return <StatusBadge tone={tone}>{status}</StatusBadge>;
}

export function CommissionStatusBadge({ status }: { status: CommissionStatus }) {
  const tone =
    status === "posted"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "reversed" || status === "failed"
          ? "danger"
          : "neutral";
  return <StatusBadge tone={tone}>{status}</StatusBadge>;
}

export function AcquisitionSourceBadge({ source }: { source: "AGENT" | "USER_REFERRAL" }) {
  return <StatusBadge tone={source === "AGENT" ? "info" : "neutral"}>{source === "AGENT" ? "Agent" : "User referral"}</StatusBadge>;
}
