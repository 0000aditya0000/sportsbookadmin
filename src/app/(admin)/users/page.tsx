import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersScreen } from "@/features/users/users-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Users" };

export default function UsersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <UsersScreen />
    </Suspense>
  );
}
