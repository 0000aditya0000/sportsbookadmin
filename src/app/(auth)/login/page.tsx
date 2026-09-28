import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/features/auth/login-screen";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading sign-in</main>}>
      <LoginScreen />
    </Suspense>
  );
}
