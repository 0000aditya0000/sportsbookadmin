import type { Metadata } from "next";
import { Suspense } from "react";
import { WalletScreen } from "@/features/wallet/wallet-screen";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Wallet" };

export default function WalletPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <WalletScreen />
    </Suspense>
  );
}
