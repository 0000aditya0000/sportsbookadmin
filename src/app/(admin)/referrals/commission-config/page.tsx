import type { Metadata } from "next";
import { Suspense } from "react";
import { CommissionConfigScreen } from "@/features/referrals/commission-config-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Referral Commission Configuration" };

export default function CommissionConfigPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <CommissionConfigScreen />
    </Suspense>
  );
}
