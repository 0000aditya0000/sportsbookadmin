import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsScreen } from "@/features/events/events-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <EventsScreen />
    </Suspense>
  );
}
