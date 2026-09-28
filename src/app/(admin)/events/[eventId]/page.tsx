import type { Metadata } from "next";
import { Suspense } from "react";
import { EventDetailScreen } from "@/features/events/event-detail-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Event detail" };

export default async function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <EventDetailScreen eventId={eventId} />
    </Suspense>
  );
}
