import type { Metadata } from "next";
import { Suspense } from "react";
import { CommissionsScreen } from "@/features/referrals/commissions-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Referral Commission History" };

export default function ReferralCommissionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <CommissionsScreen />
    </Suspense>
  );
}
