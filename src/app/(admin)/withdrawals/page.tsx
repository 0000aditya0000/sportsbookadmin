import type { Metadata } from "next";
import { Suspense } from "react";
import { WithdrawalsScreen } from "@/features/withdrawals/withdrawals-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Withdrawals" };

export default function WithdrawalsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <WithdrawalsScreen />
    </Suspense>
  );
}
