import type { Metadata } from "next";
import { Suspense } from "react";
import { ReferralsScreen } from "@/features/referrals/referrals-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Referral Management" };

export default function ReferralsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ReferralsScreen />
    </Suspense>
  );
}
