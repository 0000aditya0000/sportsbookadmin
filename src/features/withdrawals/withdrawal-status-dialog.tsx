"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { FormField } from "@/components/forms/form-field";
import { Textarea } from "@/components/ui/textarea";
import { setWithdrawalStatus } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/errors";
import {
  withdrawalStatusChangeSchema,
  type WithdrawalListItem,
  type WithdrawalStatusChange,
} from "@/lib/validation/withdrawals";

export function WithdrawalStatusDialog({
  withdrawal,
  action,
  onOpenChange,
  onCompleted,
}: {
  withdrawal: Pick<WithdrawalListItem, "id" | "userName" | "status" | "amount">;
  action: WithdrawalStatusChange["action"];
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const needsReason = action === "reject";

  async function confirm() {
    const parsed = withdrawalStatusChangeSchema.safeParse({ action, reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a reason.");
      return;
    }
    setLoading(true);
    try {
      const result = await setWithdrawalStatus(withdrawal.id, parsed.data);
      const status = result.data.withdrawal.status;
      const ok =
        (action === "approve" && status === "approved") || (action === "reject" && status === "rejected");
      if (!ok) {
        toast.error("Unable to update withdrawal.", { description: result.requestId });
        return;
      }
      toast.success(action === "approve" ? "Withdrawal approved." : "Withdrawal rejected.");
      onCompleted();
      onOpenChange(false);
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Unable to update withdrawal.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      title={action === "approve" ? "Approve withdrawal" : "Reject withdrawal"}
      description={
        action === "approve"
          ? `Approve ${withdrawal.id} for ${withdrawal.userName}. The backend records the decision.`
          : `Reject ${withdrawal.id}. A reason is required.`
      }
      confirmLabel={action === "approve" ? "Approve" : "Reject"}
      variant={action === "reject" ? "destructive" : "primary"}
      loading={loading}
      onConfirm={() => void confirm()}
    >
      {needsReason ? (
        <FormField label="Reason" htmlFor="withdrawal-reason" error={error}>
          <Textarea
            id="withdrawal-reason"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError(undefined);
            }}
            rows={3}
          />
        </FormField>
      ) : null}
    </ConfirmDialog>
  );
}
