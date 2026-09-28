import type { Metadata } from "next";
import { Suspense } from "react";
import { DepositDetailScreen } from "@/features/deposits/deposit-detail-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Deposit detail" };

export default async function DepositDetailPage({ params }: { params: Promise<{ depositId: string }> }) {
  const { depositId } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <DepositDetailScreen depositId={depositId} />
    </Suspense>
  );
}
