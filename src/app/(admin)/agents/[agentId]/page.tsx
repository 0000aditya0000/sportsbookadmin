import type { Metadata } from "next";
import { Suspense } from "react";
import { AgentDetailScreen } from "@/features/agents/agent-detail-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Agent detail" };

export default async function AgentDetailPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <AgentDetailScreen agentId={agentId} />
    </Suspense>
  );
}
