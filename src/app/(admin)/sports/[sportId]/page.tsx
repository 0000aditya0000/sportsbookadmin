import type { Metadata } from "next";
import { Suspense } from "react";
import { SportDetailScreen } from "@/features/sports/sport-detail-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Sport detail" };

export default async function SportDetailPage({ params }: { params: Promise<{ sportId: string }> }) {
  const { sportId } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <SportDetailScreen sportId={sportId} />
    </Suspense>
  );
}
