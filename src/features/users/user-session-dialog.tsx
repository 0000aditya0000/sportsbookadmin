"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { revokeUserSession } from "@/lib/api/users";
import { ApiError } from "@/lib/api/errors";

export function UserSessionDialog({
  userId,
  userName,
  sessionId,
  device,
  onOpenChange,
  onCompleted,
}: {
  userId: string;
  userName: string;
  sessionId: string;
  device?: string;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setLoading(true);
    try {
      const result = await revokeUserSession(userId, sessionId);
      if (result.data.session.status !== "revoked") {
        toast.error("Unable to revoke session.", { description: result.requestId });
        return;
      }
      toast.success("Session revoked successfully.", { description: result.requestId });
      onCompleted();
      onOpenChange(false);
    } catch (caught) {
      const message = caught instanceof ApiError ? caught.message : "Unable to revoke session.";
      setError(message);
      toast.error("Unable to revoke session.", { description: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      open
      title="Logout user"
      description="This will revoke the user's active server-side session."
      confirmLabel="Logout user"
      variant="destructive"
      loading={loading}
      details={[
        { label: "User", value: userName },
        { label: "User ID", value: userId },
        ...(device ? [{ label: "Session", value: device }] : []),
      ]}
      onConfirm={() => void confirm()}
      onOpenChange={onOpenChange}
    >
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </ConfirmDialog>
  );
}
