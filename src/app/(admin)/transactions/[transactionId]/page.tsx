import type { Metadata } from "next";
import { Suspense } from "react";
import { TransactionDetailScreen } from "@/features/transactions/transaction-detail-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Transaction detail" };

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <TransactionDetailScreen transactionId={transactionId} />
    </Suspense>
  );
}
