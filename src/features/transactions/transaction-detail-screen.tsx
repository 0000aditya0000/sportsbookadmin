"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { CopyButton } from "@/components/display/copy-button";
import { MoneyDisplay } from "@/components/display/money-display";
import { PageHeader } from "@/components/layout/page-header";
import { QueryFailure } from "@/components/states/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionStatusBadge } from "@/features/finance/finance-status-badges";
import { getTransaction } from "@/lib/api/transactions";
import { formatDateTime } from "@/lib/format";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function TransactionDetailScreen({ transactionId }: { transactionId: string }) {
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);
  const canViewWallet = usePermission(PERMISSIONS.WALLET_VIEW);

  const query = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => getTransaction(transactionId),
  });
  const detail = query.data?.data;
  const transaction = detail?.transaction;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title={transaction?.id ?? "Transaction"}
        description={
          transaction
            ? `${transaction.type.split("_").join(" ")} · ${transaction.userName}`
            : "Wallet movement detail."
        }
        meta={
          transaction ? (
            <span className="inline-flex flex-wrap items-center gap-2">
              <TransactionStatusBadge status={transaction.status} />
              <span className="uppercase">{transaction.flow}</span>
              <span className="inline-flex items-center gap-1 font-mono">
                {transaction.id}
                <CopyButton value={transaction.id} label={`Copy ${transaction.id}`} />
              </span>
              <span className="font-mono">{formatDateTime(transaction.createdAt)}</span>
            </span>
          ) : null
        }
      />

      {detail?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Read-only ledger entry. Amounts are supplied by the service and are not recalculated here.</span>
        </div>
      ) : null}

      {query.isError && !detail ? (
        <QueryFailure
          error={query.error}
          onRetry={() => void query.refetch()}
          fallback="This transaction could not be loaded."
        />
      ) : null}

      {!detail && query.isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : null}

      {detail && transaction ? (
        <section className="overflow-hidden rounded-md border border-border bg-card" aria-label="Transaction facts">
          <dl>
            <Fact label="Amount" value={<MoneyDisplay money={transaction.amount} />} />
            <Fact label="Type" value={<span className="uppercase">{transaction.type.split("_").join(" ")}</span>} />
            <Fact label="Flow" value={<span className="uppercase">{transaction.flow}</span>} />
            <Fact label="Status" value={<TransactionStatusBadge status={transaction.status} />} />
            <Fact
              label="User"
              value={
                canViewUser ? (
                  <Link href={`/users/${transaction.userId}?tab=transactions`} className="hover:underline">
                    {transaction.userName}
                  </Link>
                ) : (
                  transaction.userName
                )
              }
            />
            <Fact
              label="Agent"
              value={
                canViewAgent ? (
                  <Link href={`/agents/${transaction.agentId}`} className="hover:underline">
                    {transaction.agentName}
                  </Link>
                ) : (
                  transaction.agentName
                )
              }
            />
            <Fact
              label="Wallet"
              value={
                <span className="inline-flex items-center gap-1 font-mono text-[12px]">
                  {canViewWallet ? (
                    <Link href={`/wallet?q=${encodeURIComponent(transaction.walletId)}`} className="hover:underline">
                      {transaction.walletId}
                    </Link>
                  ) : (
                    transaction.walletId
                  )}
                  <CopyButton value={transaction.walletId} label={`Copy ${transaction.walletId}`} />
                </span>
              }
            />
            <Fact
              label="Reference"
              value={
                <span className="inline-flex items-center gap-1 font-mono text-[12px]">
                  {transaction.reference}
                  <CopyButton value={transaction.reference} label={`Copy ${transaction.reference}`} />
                </span>
              }
            />
            <Fact label="Created" value={<span className="font-mono text-[12px]">{formatDateTime(transaction.createdAt)}</span>} />
            <Fact label="As of" value={<span className="font-mono text-[12px]">{formatDateTime(detail.generatedAt)}</span>} />
          </dl>
        </section>
      ) : null}
    </div>
  );
}
