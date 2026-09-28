"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { FormField } from "@/components/forms/form-field";
import { Textarea } from "@/components/ui/textarea";
import { setAgentStatus } from "@/lib/api/agents";
import { ApiError } from "@/lib/api/errors";
import { agentStatusChangeSchema, type AgentListItem } from "@/lib/validation/agents";
import { agentStatusLabel } from "@/features/agents/agent-status-badge";

export function AgentStatusDialog({
  agent,
  action,
  onOpenChange,
  onCompleted,
}: {
  agent: AgentListItem;
  action: "suspend" | "activate";
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const suspending = action === "suspend";

  async function confirm() {
    const parsed = agentStatusChangeSchema.safeParse({ action, reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a reason.");
      return;
    }
    setLoading(true);
    try {
      const result = await setAgentStatus(agent.id, parsed.data);
      const status = result.data.agent.status;
      const expected = suspending ? "suspended" : "active";
      if (status !== expected) {
        toast.error("The backend did not confirm the new status.", { description: result.requestId });
        return;
      }
      toast.success(result.message ?? (suspending ? "Suspension submitted." : "Activation submitted."), {
        description: result.requestId,
      });
      onCompleted();
      onOpenChange(false);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "The status change was not accepted.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      open
      title={suspending ? "Suspend agent" : "Activate agent"}
      description={
        suspending
          ? "Suspension stops new betting for this desk after the backend accepts it. Open bets stay with the book until settlement."
          : "Activation restores this desk after the backend accepts it."
      }
      confirmLabel={suspending ? "Suspend agent" : "Activate agent"}
      variant={suspending ? "destructive" : "primary"}
      loading={loading}
      details={[
        { label: "Agent", value: agent.name },
        { label: "Agent ID", value: agent.id },
        { label: "Current status", value: agentStatusLabel(agent.status) },
        { label: "Action", value: suspending ? "Suspend" : "Activate" },
      ]}
      onConfirm={() => void confirm()}
      onOpenChange={onOpenChange}
    >
      {suspending ? (
        <FormField label="Reason" htmlFor="agent-status-reason" error={error ?? undefined}>
          <Textarea
            id="agent-status-reason"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError(null);
            }}
            placeholder="Why is this desk being suspended?"
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
