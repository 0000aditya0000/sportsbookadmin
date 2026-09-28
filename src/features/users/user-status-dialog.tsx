"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { FormField } from "@/components/forms/form-field";
import { Textarea } from "@/components/ui/textarea";
import { setUserStatus } from "@/lib/api/users";
import { ApiError } from "@/lib/api/errors";
import { userStatusChangeSchema, type UserListItem, type UserStatusChange } from "@/lib/validation/users";
import { userStatusLabel } from "@/features/users/user-status-badge";

const copy: Record<
  UserStatusChange["action"],
  { title: string; description: string; confirm: string; failure: string; variant: "primary" | "destructive" }
> = {
  suspend: {
    title: "Suspend user",
    description: "You are about to suspend this account. The backend records the decision after you confirm.",
    confirm: "Suspend user",
    failure: "Unable to suspend user.",
    variant: "destructive",
  },
  activate: {
    title: "Activate user",
    description: "Activation restores a suspended account after the backend accepts it.",
    confirm: "Activate",
    failure: "Unable to activate user.",
    variant: "primary",
  },
  ban: {
    title: "Ban user",
    description: "Banning blocks this account. The console does not authorize the ban; the backend records it after you confirm.",
    confirm: "Ban user",
    failure: "Unable to ban user.",
    variant: "destructive",
  },
  unlock: {
    title: "Unlock user",
    description: "Unlock clears the locked state. The backend chooses the resulting status. Unlocking is not the same as activating.",
    confirm: "Unlock user",
    failure: "Unable to unlock user.",
    variant: "primary",
  },
};

export function UserStatusDialog({
  user,
  action,
  onOpenChange,
  onCompleted,
}: {
  user: Pick<UserListItem, "id" | "displayName" | "status">;
  action: UserStatusChange["action"];
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const needsReason = action === "suspend" || action === "ban";
  const text = copy[action];

  async function confirm() {
    const parsed = userStatusChangeSchema.safeParse({ action, reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a reason.");
      return;
    }
    setLoading(true);
    try {
      const result = await setUserStatus(user.id, parsed.data);
      const status = result.data.user.status;
      const confirmed =
        (action === "suspend" && status === "suspended") ||
        (action === "activate" && status === "active") ||
        (action === "ban" && status === "banned") ||
        (action === "unlock" && status !== "locked");
      if (!confirmed) {
        toast.error(text.failure, { description: result.requestId });
        return;
      }
      const success =
        action === "unlock"
          ? `User unlocked successfully. Status is now ${userStatusLabel(status)}.`
          : action === "suspend"
            ? "User suspended successfully."
            : action === "activate"
              ? "User activated successfully."
              : "User banned successfully.";
      toast.success(success, { description: result.requestId });
      onCompleted();
      onOpenChange(false);
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : text.failure;
      setError(message);
      toast.error(text.failure, { description: message });
    } finally {
      setLoading(false);
    }
  }

  const details = [
    { label: "User", value: user.displayName },
    { label: "User ID", value: user.id },
    { label: "Current status", value: userStatusLabel(user.status) },
    { label: "Action", value: text.confirm },
  ];
  if (action === "activate") details.push({ label: "New status", value: "Active" });

  return (
    <ConfirmDialog
      open
      title={text.title}
      description={text.description}
      confirmLabel={text.confirm}
      variant={text.variant}
      loading={loading}
      details={details}
      onConfirm={() => void confirm()}
      onOpenChange={onOpenChange}
    >
      {needsReason ? (
        <FormField label="Reason" htmlFor="user-status-reason" error={error ?? undefined}>
          <Textarea
            id="user-status-reason"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError(null);
            }}
            placeholder={action === "ban" ? "Why is this account being banned?" : "Why is this account being suspended?"}
          />
        </FormField>
      ) : error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </ConfirmDialog>
  );
}
