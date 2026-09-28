import type { Metadata } from "next";
import { Suspense } from "react";
import { DepositsScreen } from "@/features/deposits/deposits-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Deposits" };

export default function DepositsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <DepositsScreen />
    </Suspense>
  );
}
