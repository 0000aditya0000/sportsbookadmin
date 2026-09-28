import type { Metadata } from "next";
import { Suspense } from "react";
import { TransactionsScreen } from "@/features/transactions/transactions-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Transactions" };

export default function TransactionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <TransactionsScreen />
    </Suspense>
  );
}
