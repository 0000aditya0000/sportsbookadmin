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
import { DepositStatusDialog } from "@/features/deposits/deposit-status-dialog";
import { DepositStatusBadge } from "@/features/finance/finance-status-badges";
import { getDeposit } from "@/lib/api/payments";
import { formatDateTime } from "@/lib/format";
import type { DepositStatusChange } from "@/lib/validation/deposits";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function DepositDetailScreen({ depositId }: { depositId: string }) {
  const queryClient = useQueryClient();
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);
  const canApprove = usePermission(PERMISSIONS.DEPOSIT_APPROVE);
  const canReject = usePermission(PERMISSIONS.DEPOSIT_REJECT);
  const [statusAction, setStatusAction] = useState<DepositStatusChange["action"] | null>(null);

  const query = useQuery({
    queryKey: ["deposit", depositId],
    queryFn: () => getDeposit(depositId),
  });
  const detail = query.data?.data;
  const deposit = detail?.deposit;
  const pending = deposit?.status === "pending";

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["deposit", depositId] });
    void queryClient.invalidateQueries({ queryKey: ["deposits"] });
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title={deposit?.id ?? "Deposit"}
        description={deposit ? `${deposit.userName} · ${deposit.method}` : "Deposit request detail."}
        meta={
          deposit ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              <DepositStatusBadge status={deposit.status} />
              <span className="inline-flex items-center gap-1 font-mono">
                {deposit.id}
                <CopyButton value={deposit.id} label={`Copy ${deposit.id}`} />
              </span>
              <span className="font-mono">{formatDateTime(deposit.createdAt)}</span>
            </span>
          ) : null
        }
        actions={
          deposit && pending ? (
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
          <span>Deposit decision is recorded by the service. Amounts are not recalculated in the UI.</span>
        </div>
      ) : null}

      {query.isError && !detail ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="This deposit could not be loaded." />
      ) : null}

      {!detail && query.isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : null}

      {detail && deposit ? (
        <section className="overflow-hidden rounded-md border border-border bg-card" aria-label="Deposit facts">
          <dl>
            <Fact label="Amount" value={<MoneyDisplay money={deposit.amount} />} />
            <Fact label="Status" value={<DepositStatusBadge status={deposit.status} />} />
            <Fact label="Method" value={deposit.method} />
            <Fact
              label="User"
              value={
                canViewUser ? (
                  <Link href={`/users/${deposit.userId}?tab=transactions`} className="hover:underline">
                    {deposit.userName}
                  </Link>
                ) : (
                  deposit.userName
                )
              }
            />
            <Fact
              label="Agent"
              value={
                canViewAgent ? (
                  <Link href={`/agents/${deposit.agentId}`} className="hover:underline">
                    {deposit.agentName}
                  </Link>
                ) : (
                  deposit.agentName
                )
              }
            />
            <Fact
              label="Provider reference"
              value={
                <span className="inline-flex items-center gap-1 font-mono text-[12px]">
                  {deposit.providerReference}
                  <CopyButton value={deposit.providerReference} label={`Copy ${deposit.providerReference}`} />
                </span>
              }
            />
            <Fact label="Created" value={<span className="font-mono text-[12px]">{formatDateTime(deposit.createdAt)}</span>} />
            <Fact label="Updated" value={<span className="font-mono text-[12px]">{formatDateTime(deposit.updatedAt)}</span>} />
            {deposit.reason ? <Fact label="Reason" value={deposit.reason} /> : null}
            <Fact label="As of" value={<span className="font-mono text-[12px]">{formatDateTime(detail.generatedAt)}</span>} />
          </dl>
        </section>
      ) : null}

      {statusAction && deposit ? (
        <DepositStatusDialog
          key={statusAction}
          deposit={deposit}
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
