import { StatusBadge } from "@/components/ui/status-badge";

export function TransactionStatusBadge({ status }: { status: "posted" | "pending" | "failed" }) {
  const tone = status === "posted" ? "success" : status === "pending" ? "warning" : "danger";
  return <StatusBadge tone={tone}>{status}</StatusBadge>;
}

export function DepositStatusBadge({
  status,
}: {
  status: "pending" | "completed" | "rejected" | "reversed";
}) {
  const tone =
    status === "completed" ? "success" : status === "pending" ? "warning" : status === "rejected" ? "danger" : "neutral";
  return <StatusBadge tone={tone}>{status}</StatusBadge>;
}

export function WithdrawalStatusBadge({
  status,
}: {
  status: "pending" | "approved" | "rejected" | "paid" | "failed";
}) {
  const tone =
    status === "paid" || status === "approved"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "rejected" || status === "failed"
          ? "danger"
          : "neutral";
  return <StatusBadge tone={tone}>{status}</StatusBadge>;
}
