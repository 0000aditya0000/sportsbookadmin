import type { Metadata } from "next";
import { Suspense } from "react";
import { AgentsScreen } from "@/features/agents/agents-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Agents" };

export default function AgentsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AgentsScreen />
    </Suspense>
  );
}
