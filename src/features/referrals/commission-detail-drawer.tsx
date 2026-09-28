"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CopyButton } from "@/components/display/copy-button";
import { MoneyDisplay } from "@/components/display/money-display";
import { PercentageDisplay } from "@/components/display/percentage-display";
import { QueryFailure } from "@/components/states/feedback-states";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { CommissionStatusBadge } from "@/features/referrals/referral-status-badges";
import { getReferralCommission } from "@/lib/api/referrals";
import { formatDateTime } from "@/lib/format";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function CommissionDetailDrawer({
  commissionId,
  onOpenChange,
}: {
  commissionId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const query = useQuery({
    queryKey: ["referral-commission", commissionId],
    queryFn: () => getReferralCommission(commissionId),
  });
  const detail = query.data?.data;
  const commission = detail?.commission;

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="left-auto right-0 w-[min(100%,28rem)] overflow-y-auto bg-card text-foreground">
        <div className="border-b border-border px-4 py-4">
          <SheetTitle className="text-base font-semibold">{commission?.id ?? "Commission"}</SheetTitle>
          <SheetDescription className="text-xs">
            Historical applied rate is preserved separately from current configuration.
          </SheetDescription>
        </div>
        {query.isError && !detail ? (
          <div className="p-4">
            <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="Commission could not be loaded." />
          </div>
        ) : null}
        {!detail && query.isLoading ? <Skeleton className="m-4 h-48" /> : null}
        {detail && commission ? (
          <>
            <section className="border-b border-border">
              <h3 className="px-4 pt-4 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Bet</h3>
              <dl>
                <Fact
                  label="Bet ID"
                  value={
                    <span className="inline-flex items-center gap-1 font-mono text-[12px]">
                      {commission.betId}
                      <CopyButton value={commission.betId} label={`Copy ${commission.betId}`} />
                    </span>
                  }
                />
                <Fact
                  label="Bet user"
                  value={
                    <Link href={`/users/${commission.betUserId}?tab=referrals`} className="hover:underline">
                      {commission.betUserName}
                    </Link>
                  }
                />
                <Fact label="Bet amount" value={<MoneyDisplay money={commission.betAmount} />} />
              </dl>
            </section>
            <section className="border-b border-border">
              <h3 className="px-4 pt-4 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Referral
              </h3>
              <dl>
                <Fact
                  label="Beneficiary"
                  value={
                    <Link href={`/users/${commission.beneficiaryId}?tab=referrals`} className="hover:underline">
                      {commission.beneficiaryName}
                    </Link>
                  }
                />
                <Fact label="Referral level" value={`Level ${commission.level}`} />
                <Fact
                  label="Direct referrer"
                  value={
                    detail.directReferrerId && detail.directReferrerName
                      ? `${detail.directReferrerName} (${detail.directReferrerId})`
                      : "—"
                  }
                />
                <Fact
                  label="Agent owner"
                  value={`${commission.agentOwnerName} (${commission.agentOwnerId})`}
                />
              </dl>
            </section>
            <section className="border-b border-border">
              <h3 className="px-4 pt-4 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Calculation
              </h3>
              <dl>
                <Fact label="Bet amount" value={<MoneyDisplay money={commission.betAmount} />} />
                <Fact label="Applied rate" value={<PercentageDisplay value={commission.appliedRatePercent} />} />
                <Fact label="Current level rate" value={<PercentageDisplay value={detail.currentRatePercent} />} />
                <Fact label="Commission amount" value={<MoneyDisplay money={commission.commissionAmount} />} />
              </dl>
            </section>
            <section>
              <h3 className="px-4 pt-4 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Accounting
              </h3>
              <dl>
                <Fact label="Status" value={<CommissionStatusBadge status={commission.status} />} />
                <Fact
                  label="Ledger transaction"
                  value={
                    commission.ledgerTransactionId ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[12px]">
                        {commission.ledgerTransactionId}
                        <CopyButton
                          value={commission.ledgerTransactionId}
                          label={`Copy ${commission.ledgerTransactionId}`}
                        />
                      </span>
                    ) : (
                      "—"
                    )
                  }
                />
                <Fact label="Created" value={<span className="font-mono text-[12px]">{formatDateTime(commission.createdAt)}</span>} />
                <Fact label="Updated" value={<span className="font-mono text-[12px]">{formatDateTime(commission.updatedAt)}</span>} />
              </dl>
            </section>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
