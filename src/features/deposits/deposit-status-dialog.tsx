"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { FormField } from "@/components/forms/form-field";
import { Textarea } from "@/components/ui/textarea";
import { setDepositStatus } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/errors";
import { depositStatusChangeSchema, type DepositListItem, type DepositStatusChange } from "@/lib/validation/deposits";

export function DepositStatusDialog({
  deposit,
  action,
  onOpenChange,
  onCompleted,
}: {
  deposit: Pick<DepositListItem, "id" | "userName" | "status" | "amount">;
  action: DepositStatusChange["action"];
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const needsReason = action === "reject";

  async function confirm() {
    const parsed = depositStatusChangeSchema.safeParse({ action, reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a reason.");
      return;
    }
    setLoading(true);
    try {
      const result = await setDepositStatus(deposit.id, parsed.data);
      const status = result.data.deposit.status;
      const ok =
        (action === "approve" && status === "completed") || (action === "reject" && status === "rejected");
      if (!ok) {
        toast.error("Unable to update deposit.", { description: result.requestId });
        return;
      }
      toast.success(action === "approve" ? "Deposit completed." : "Deposit rejected.");
      onCompleted();
      onOpenChange(false);
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Unable to update deposit.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      title={action === "approve" ? "Approve deposit" : "Reject deposit"}
      description={
        action === "approve"
          ? `Confirm completion for ${deposit.userName} (${deposit.id}). The backend records the decision.`
          : `Reject ${deposit.id}. A reason is required.`
      }
      confirmLabel={action === "approve" ? "Approve" : "Reject"}
      variant={action === "reject" ? "destructive" : "primary"}
      loading={loading}
      onConfirm={() => void confirm()}
    >
      {needsReason ? (
        <FormField label="Reason" htmlFor="deposit-reason" error={error}>
          <Textarea
            id="deposit-reason"
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
