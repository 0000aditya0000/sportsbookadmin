"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { CopyButton } from "@/components/display/copy-button";
import { MoneyDisplay } from "@/components/display/money-display";
import { PageHeader } from "@/components/layout/page-header";
import { QueryFailure } from "@/components/states/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WithdrawalStatusBadge } from "@/features/finance/finance-status-badges";
import { WithdrawalStatusDialog } from "@/features/withdrawals/withdrawal-status-dialog";
import { getWithdrawal } from "@/lib/api/payments";
import { formatDateTime } from "@/lib/format";
import type { WithdrawalStatusChange } from "@/lib/validation/withdrawals";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function WithdrawalDetailScreen({ withdrawalId }: { withdrawalId: string }) {
  const queryClient = useQueryClient();
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);
  const canApprove = usePermission(PERMISSIONS.WITHDRAWAL_APPROVE);
  const canReject = usePermission(PERMISSIONS.WITHDRAWAL_REJECT);
  const [statusAction, setStatusAction] = useState<WithdrawalStatusChange["action"] | null>(null);

  const query = useQuery({
    queryKey: ["withdrawal", withdrawalId],
    queryFn: () => getWithdrawal(withdrawalId),
  });
  const detail = query.data?.data;
  const withdrawal = detail?.withdrawal;
  const pending = withdrawal?.status === "pending";

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["withdrawal", withdrawalId] });
    void queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title={withdrawal?.id ?? "Withdrawal"}
        description={withdrawal ? `${withdrawal.userName} · ${withdrawal.method}` : "Withdrawal request detail."}
        meta={
          withdrawal ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              <WithdrawalStatusBadge status={withdrawal.status} />
              <span className="inline-flex items-center gap-1 font-mono">
                {withdrawal.id}
                <CopyButton value={withdrawal.id} label={`Copy ${withdrawal.id}`} />
              </span>
              <span className="font-mono">{formatDateTime(withdrawal.createdAt)}</span>
            </span>
          ) : null
        }
        actions={
          withdrawal && pending ? (
            <>
              {canApprove ? <Button onClick={() => setStatusAction("approve")}>Approve</Button> : null}
              {canReject ? (
                <Button variant="destructive" onClick={() => setStatusAction("reject")}>
                  Reject
                </Button>
              ) : null}
            </>
          ) : null
        }
      />

      {detail?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Withdrawal decision is recorded by the service. Amounts are not recalculated in the UI.</span>
        </div>
      ) : null}

      {query.isError && !detail ? (
        <QueryFailure
          error={query.error}
          onRetry={() => void query.refetch()}
          fallback="This withdrawal could not be loaded."
        />
      ) : null}

      {!detail && query.isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : null}

      {detail && withdrawal ? (
        <section className="overflow-hidden rounded-md border border-border bg-card" aria-label="Withdrawal facts">
          <dl>
            <Fact label="Amount" value={<MoneyDisplay money={withdrawal.amount} />} />
            <Fact label="Status" value={<WithdrawalStatusBadge status={withdrawal.status} />} />
            <Fact label="Method" value={withdrawal.method} />
            <Fact
              label="User"
              value={
                canViewUser ? (
                  <Link href={`/users/${withdrawal.userId}?tab=transactions`} className="hover:underline">
                    {withdrawal.userName}
                  </Link>
                ) : (
                  withdrawal.userName
                )
              }
            />
            <Fact
              label="Agent"
              value={
                canViewAgent ? (
                  <Link href={`/agents/${withdrawal.agentId}`} className="hover:underline">
                    {withdrawal.agentName}
                  </Link>
                ) : (
                  withdrawal.agentName
                )
              }
            />
            <Fact
              label="Provider reference"
              value={
                <span className="inline-flex items-center gap-1 font-mono text-[12px]">
                  {withdrawal.providerReference}
                  <CopyButton value={withdrawal.providerReference} label={`Copy ${withdrawal.providerReference}`} />
                </span>
              }
            />
            <Fact
              label="Created"
              value={<span className="font-mono text-[12px]">{formatDateTime(withdrawal.createdAt)}</span>}
            />
            <Fact
              label="Updated"
              value={<span className="font-mono text-[12px]">{formatDateTime(withdrawal.updatedAt)}</span>}
            />
            {withdrawal.reason ? <Fact label="Reason" value={withdrawal.reason} /> : null}
            <Fact label="As of" value={<span className="font-mono text-[12px]">{formatDateTime(detail.generatedAt)}</span>} />
          </dl>
        </section>
      ) : null}

      {statusAction && withdrawal ? (
        <WithdrawalStatusDialog
          key={statusAction}
          withdrawal={withdrawal}
          action={statusAction}
          onOpenChange={(open) => {
            if (!open) setStatusAction(null);
          }}
          onCompleted={refresh}
        />
      ) : null}
    </div>
  );
}
