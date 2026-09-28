import type { Metadata } from "next";
import { Suspense } from "react";
import { ReferralReportsScreen } from "@/features/referrals/referral-reports-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Referral Reports" };

export default function ReferralReportsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ReferralReportsScreen />
    </Suspense>
  );
}
