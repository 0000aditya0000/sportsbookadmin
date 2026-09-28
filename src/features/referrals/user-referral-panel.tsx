"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MoneyDisplay } from "@/components/display/money-display";
import { EmptyState, QueryFailure } from "@/components/states/feedback-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AcquisitionSourceBadge } from "@/features/referrals/referral-status-badges";
import { getUserReferral } from "@/lib/api/referrals";
import { formatCount } from "@/lib/format";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function UserReferralPanel({ userId }: { userId: string }) {
  const query = useQuery({
    queryKey: ["user-referral", userId],
    queryFn: () => getUserReferral(userId),
  });
  const detail = query.data?.data;

  if (query.isError && !detail) {
    return (
      <QueryFailure
        error={query.error}
        onRetry={() => void query.refetch()}
        fallback="You don't have permission to view this referral data."
      />
    );
  }
  if (!detail && query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (!detail) {
    return <EmptyState title="No referral information" description="The backend has no referral profile for this user." />;
  }

  return (
    <div className="grid gap-4">
      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Referral information</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Direct referrer and agent owner are separate relationships.
          </p>
        </div>
        <dl>
          <Fact label="Referral code" value={<span className="font-mono text-[12px]">{detail.referralCode}</span>} />
          <Fact
            label="Direct referrer"
            value={
              detail.directReferrerId && detail.directReferrerName ? (
                <Link href={`/users/${detail.directReferrerId}?tab=referrals`} className="hover:underline">
                  {detail.directReferrerName}
                </Link>
              ) : (
                "—"
              )
            }
          />
          <Fact label="Referral source" value={<AcquisitionSourceBadge source={detail.acquisitionSource} />} />
          <Fact
            label="Agent owner"
            value={
              <Link href={`/agents/${detail.agentOwnerId}?tab=referrals`} className="hover:underline">
                {detail.agentOwnerName}
              </Link>
            }
          />
          <Fact label="Referral level" value={detail.referralLevel ? `Level ${detail.referralLevel}` : "Root"} />
        </dl>
      </section>

      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Referral network summary</h2>
        </div>
        <dl>
          {([1, 2, 3, 4, 5, 6] as const).map((level) => (
            <Fact key={level} label={`Level ${level}`} value={formatCount(detail.network[`level${level}`])} />
          ))}
        </dl>
      </section>

      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Commission summary</h2>
        </div>
        <dl>
          <Fact label="Total" value={<MoneyDisplay money={detail.commissions.total} />} />
          <Fact label="Pending" value={<MoneyDisplay money={detail.commissions.pending} />} />
          <Fact label="Posted" value={<MoneyDisplay money={detail.commissions.posted} />} />
          <Fact label="Reversed" value={<MoneyDisplay money={detail.commissions.reversed} />} />
        </dl>
      </section>

      <div>
        <Button variant="outline" asChild>
          <Link href={`/referrals/tree?userId=${detail.userId}`}>Open referral tree</Link>
        </Button>
      </div>
    </div>
  );
}
