import type { Metadata } from "next";
import { Suspense } from "react";
import { UserDetailScreen } from "@/features/users/user-detail-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "User detail" };

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <UserDetailScreen userId={userId} />
    </Suspense>
  );
}
