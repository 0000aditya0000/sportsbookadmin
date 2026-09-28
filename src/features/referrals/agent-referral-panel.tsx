"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MoneyDisplay } from "@/components/display/money-display";
import { EmptyState, QueryFailure } from "@/components/states/feedback-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAgentReferral } from "@/lib/api/referrals";
import { formatCount } from "@/lib/format";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export function AgentReferralPanel({ agentId }: { agentId: string }) {
  const query = useQuery({
    queryKey: ["agent-referral", agentId],
    queryFn: () => getAgentReferral(agentId),
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
    return (
      <EmptyState
        title="No referral network"
        description="The backend has no referral network summary for this agent owner."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Referral network</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Agent ownership is not the same as referral hierarchy. Figures below describe the referral network under
            this agent owner.
          </p>
        </div>
        <dl>
          <Fact label="Agent referral code" value={<span className="font-mono text-[12px]">{detail.agentReferralCode}</span>} />
          <Fact label="Direct referrals" value={formatCount(detail.directReferrals)} />
          <Fact label="Total downline" value={formatCount(detail.totalDownline)} />
          <Fact label="Commission generated" value={<MoneyDisplay money={detail.commissionGenerated} />} />
        </dl>
      </section>
      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Level counts</h2>
        </div>
        <dl>
          {([1, 2, 3, 4, 5, 6] as const).map((level) => (
            <Fact key={level} label={`Level ${level}`} value={formatCount(detail.network[`level${level}`])} />
          ))}
        </dl>
      </section>
      <div>
        <Button variant="outline" asChild>
          <Link href={`/referrals?agent=${detail.agentId}`}>Open referral users</Link>
        </Button>
      </div>
    </div>
  );
}
