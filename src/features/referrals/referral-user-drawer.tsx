"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MoneyDisplay } from "@/components/display/money-display";
import { EmptyState, QueryFailure } from "@/components/states/feedback-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  AcquisitionSourceBadge,
} from "@/features/referrals/referral-status-badges";
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

export function ReferralUserDrawer({
  userId,
  onOpenChange,
}: {
  userId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const query = useQuery({
    queryKey: ["user-referral", userId],
    queryFn: () => getUserReferral(userId),
  });
  const detail = query.data?.data;

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="left-auto right-0 w-[min(100%,28rem)] overflow-y-auto bg-card text-foreground">
        <div className="border-b border-border px-4 py-4">
          <SheetTitle className="text-base font-semibold">{detail?.displayName ?? "Referral user"}</SheetTitle>
          <SheetDescription className="font-mono text-xs">{userId}</SheetDescription>
        </div>

        {query.isError && !detail ? (
          <div className="p-4">
            <QueryFailure
              error={query.error}
              onRetry={() => void query.refetch()}
              fallback="You don't have permission to view this referral data."
            />
          </div>
        ) : null}
        {!detail && query.isLoading ? <Skeleton className="m-4 h-48" /> : null}

        {detail ? (
          <>
            <section className="border-b border-border">
              <h3 className="px-4 pt-4 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                User information
              </h3>
              <dl>
                <Fact label="User ID" value={<span className="font-mono text-[12px]">{detail.userId}</span>} />
                <Fact label="Name" value={detail.displayName} />
              </dl>
            </section>
            <section className="border-b border-border">
              <h3 className="px-4 pt-4 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Referral information
              </h3>
              <dl>
                <Fact label="Referral code" value={<span className="font-mono text-[12px]">{detail.referralCode}</span>} />
                <Fact
                  label="Direct referrer"
                  value={
                    detail.directReferrerId && detail.directReferrerName
                      ? `${detail.directReferrerName} (${detail.directReferrerId})`
                      : "—"
                  }
                />
                <Fact label="Referral source" value={<AcquisitionSourceBadge source={detail.acquisitionSource} />} />
                <Fact
                  label="Referral level"
                  value={detail.referralLevel ? `Level ${detail.referralLevel}` : "Root"}
                />
                <Fact
                  label="Agent owner"
                  value={`${detail.agentOwnerName} (${detail.agentOwnerId})`}
                />
              </dl>
            </section>
            <section className="border-b border-border">
              <h3 className="px-4 pt-4 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Commission information
              </h3>
              <dl>
                <Fact label="Total" value={<MoneyDisplay money={detail.commissions.total} />} />
                {detail.commissions.byLevel.map((row) => (
                  <Fact key={row.level} label={`Level ${row.level}`} value={<MoneyDisplay money={row.amount} />} />
                ))}
              </dl>
            </section>
            <section className="border-b border-border">
              <h3 className="px-4 pt-4 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Network summary
              </h3>
              <dl>
                {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                  <Fact
                    key={level}
                    label={`Level ${level}`}
                    value={formatCount(detail.network[`level${level}` as const])}
                  />
                ))}
              </dl>
            </section>
            <div className="flex gap-2 p-4">
              <Button asChild>
                <Link href={`/users/${detail.userId}?tab=referrals`}>Open user</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/referrals/tree?userId=${detail.userId}`}>Open tree</Link>
              </Button>
            </div>
          </>
        ) : null}
        {!detail && !query.isLoading && !query.isError ? (
          <EmptyState title="No referral record" description="The backend has no referral profile for this user." />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
