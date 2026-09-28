import type { Metadata } from "next";
import { Suspense } from "react";
import { SportsScreen } from "@/features/sports/sports-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Sports" };

export default function SportsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <SportsScreen />
    </Suspense>
  );
}
