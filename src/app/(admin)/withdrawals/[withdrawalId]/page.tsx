import type { Metadata } from "next";
import { Suspense } from "react";
import { WithdrawalDetailScreen } from "@/features/withdrawals/withdrawal-detail-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Withdrawal detail" };

export default async function WithdrawalDetailPage({
  params,
}: {
  params: Promise<{ withdrawalId: string }>;
}) {
  const { withdrawalId } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <WithdrawalDetailScreen withdrawalId={withdrawalId} />
    </Suspense>
  );
}
