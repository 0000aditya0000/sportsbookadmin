"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { PercentageDisplay } from "@/components/display/percentage-display";
import { FormField } from "@/components/forms/form-field";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, QueryFailure } from "@/components/states/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCommissionConfig, updateCommissionConfig } from "@/lib/api/referrals";
import { ApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/format";
import {
  commissionConfigUpdateSchema,
  type CommissionConfigItem,
  type ReferralLevel,
} from "@/lib/validation/referrals";

export function CommissionConfigScreen() {
  const queryClient = useQueryClient();
  const canUpdate = usePermission(PERMISSIONS.REFERRAL_CONFIG_UPDATE);
  const [editing, setEditing] = useState<CommissionConfigItem | null>(null);
  const [draftPercent, setDraftPercent] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const query = useQuery({
    queryKey: ["referral-config"],
    queryFn: () => getCommissionConfig(),
  });
  const snapshot = query.data?.data;

  const mutation = useMutation({
    mutationFn: (payload: { level: ReferralLevel; commissionPercentage: string }) =>
      updateCommissionConfig(payload),
    onSuccess: () => {
      toast.success("Commission configuration updated.");
      void queryClient.invalidateQueries({ queryKey: ["referral-config"] });
      void queryClient.invalidateQueries({ queryKey: ["referral-reports"] });
      setConfirmOpen(false);
      setEditing(null);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : "Unable to update commission configuration. Please try again.";
      toast.error(message);
    },
  });

  function openEdit(item: CommissionConfigItem) {
    setEditing(item);
    setDraftPercent(item.ratePercent);
    setFieldError(undefined);
  }

  function requestConfirm() {
    if (!editing) return;
    const parsed = commissionConfigUpdateSchema.safeParse({
      level: editing.level,
      commissionPercentage: draftPercent,
    });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Enter a valid percentage.");
      return;
    }
    setConfirmOpen(true);
  }

  function confirmUpdate() {
    if (!editing) return;
    const parsed = commissionConfigUpdateSchema.safeParse({
      level: editing.level,
      commissionPercentage: draftPercent,
    });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Enter a valid percentage.");
      setConfirmOpen(false);
      return;
    }
    mutation.mutate(parsed.data);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Referral Commission Configuration"
        description="Configure commission percentages for the six referral levels."
        meta={
          snapshot ? (
            <span className="font-mono">
              Snapshot {formatDateTime(snapshot.generatedAt)} · {snapshot.source}
            </span>
          ) : null
        }
      />

      {snapshot?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>
            Updates apply to future qualifying bets only. Historical commission records keep their applied rate.
          </span>
        </div>
      ) : null}

      {query.isError && !snapshot ? (
        <QueryFailure
          error={query.error}
          onRetry={() => void query.refetch()}
          fallback="Commission configuration could not be loaded."
        />
      ) : null}

      {!snapshot && query.isLoading ? <Skeleton className="h-72 w-full" /> : null}

      {snapshot && snapshot.items.length === 0 ? (
        <EmptyState title="No commission configuration available" description="The backend has not published level rates." />
      ) : null}

      {snapshot && snapshot.items.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Six-level referral commission configuration</caption>
            <thead className="border-b border-border text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Commission %</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Effective from</th>
                <th className="px-4 py-3">Updated at</th>
                <th className="px-4 py-3">Updated by</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.items.map((item) => (
                <tr key={item.level} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium">Level {item.level}</td>
                  <td className="px-4 py-3">
                    <PercentageDisplay value={item.ratePercent} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={item.status === "active" ? "success" : "neutral"}>{item.status}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">
                    {formatDateTime(item.effectiveFrom)}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">
                    {formatDateTime(item.updatedAt)}
                  </td>
                  <td className="px-4 py-3">{item.updatedBy}</td>
                  <td className="px-4 py-3">
                    {canUpdate ? (
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                        Edit
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">View only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {editing ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open && !mutation.isPending) {
              setEditing(null);
              setConfirmOpen(false);
            }
          }}
        >
          <DialogContent>
            <DialogTitle className="pr-8 text-base font-semibold">Edit Level {editing.level} commission</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              Level identity cannot be changed. Enter the new commission percentage for future qualifying bets.
            </DialogDescription>
            <div className="mt-4 grid gap-3">
              <FormField label="Level" htmlFor="config-level">
                <Input id="config-level" value={`Level ${editing.level}`} disabled />
              </FormField>
              <FormField label="Commission percentage" htmlFor="config-rate" error={fieldError}>
                <Input
                  id="config-rate"
                  value={draftPercent}
                  onChange={(event) => {
                    setDraftPercent(event.target.value);
                    setFieldError(undefined);
                  }}
                  inputMode="decimal"
                />
              </FormField>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button onClick={requestConfirm} disabled={mutation.isPending}>
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {editing && confirmOpen ? (
        <ConfirmDialog
          open
          title={`Update Level ${editing.level} Commission`}
          description="This new rate will apply to future qualifying bets. Existing commission records retain their historical applied rate."
          confirmLabel="Confirm update"
          loading={mutation.isPending}
          details={[
            { label: "Current", value: `${editing.ratePercent}%` },
            { label: "New", value: `${draftPercent}%` },
          ]}
          onConfirm={confirmUpdate}
          onOpenChange={(open) => {
            if (!open && !mutation.isPending) setConfirmOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
