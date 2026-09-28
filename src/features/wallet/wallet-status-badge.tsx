import { StatusBadge } from "@/components/ui/status-badge";
import type { WalletStatus } from "@/lib/validation/wallet";

const labels: Record<WalletStatus, string> = {
  active: "Active",
  frozen: "Frozen",
  suspended: "Suspended",
  closed: "Closed",
};

const tones: Record<WalletStatus, "success" | "warning" | "danger" | "info" | "neutral"> = {
  active: "success",
  frozen: "info",
  suspended: "warning",
  closed: "neutral",
};

export function WalletStatusBadge({ status }: { status: WalletStatus }) {
  return <StatusBadge tone={tones[status]}>{labels[status]}</StatusBadge>;
}
