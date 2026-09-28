import type { Metadata } from "next";
import { Suspense } from "react";
import { ReferralTreeScreen } from "@/features/referrals/referral-tree-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Referral Tree" };

export default function ReferralTreePage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <ReferralTreeScreen />
    </Suspense>
  );
}
