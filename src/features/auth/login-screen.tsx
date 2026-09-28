"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand/brand-mark";
import { FormField } from "@/components/forms/form-field";
import { SessionExpiredState } from "@/components/states/feedback-states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDevLoginHint, login, verifyTwoFactor } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import { loginSchema, twoFactorSchema, type LoginInput } from "@/lib/validation/auth";

export function LoginScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const [showPassword, setShowPassword] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const hint = useQuery({
    queryKey: ["dev-login-hint"],
    queryFn: async () => {
      try {
        return (await getDevLoginHint()).data;
      } catch {
        return null;
      }
    },
    retry: false,
  });
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onCredentials(values: LoginInput) {
    setSubmitting(true);
    try {
      const result = await login(values);
      setChallengeId(result.data.challengeId);
      setCode("");
      setCodeError(null);
    } catch (error) {
      form.setError("password", {
        message: error instanceof ApiError ? error.message : "Sign-in failed.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function onCode(event: React.FormEvent) {
    event.preventDefault();
    if (!challengeId) return;
    const parsed = twoFactorSchema.safeParse({ challengeId, code });
    if (!parsed.success) {
      setCodeError("Enter the 6-digit code.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await verifyTwoFactor(parsed.data);
      if (!result.data.authenticated) {
        setCodeError("The server did not start a session.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success(result.message ?? "Session started.", { description: result.requestId });
      router.replace("/dashboard");
    } catch (error) {
      setCodeError(error instanceof ApiError ? error.message : "That code is not valid.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)]">
      <section className="auth-panel relative hidden flex-col justify-between p-10 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">Meridian</p>
            <p className="text-xs text-sidebar-muted">Sportsbook operations</p>
          </div>
        </div>
        <div className="max-w-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Control the book. Watch the money. Keep the feed honest.</h1>
          <p className="mt-4 text-sm leading-6 text-sidebar-muted">
            Super Admin is the operations console for agents, users, live betting, wallet movement, and provider health.
          </p>
        </div>
        <ul className="grid gap-2 text-sm text-sidebar-foreground">
          <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-sidebar-primary" /> Dummy provider connected for development</li>
          <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-sidebar-primary" /> Two-factor sign-in is required</li>
          <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-sidebar-primary" /> Sessions are issued by the server</li>
        </ul>
      </section>
      <section className="flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <div>
              <p className="text-sm font-semibold">Meridian</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
          {reason === "expired" || reason === "revoked" ? (
            <div className="mb-6 rounded-md border border-border bg-card">
              <SessionExpiredState reason={reason} />
            </div>
          ) : null}
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Super Admin</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {challengeId ? "Authentication code" : "Sign in"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {challengeId
              ? "Enter the 6-digit code for this admin. The session cookie is set only after the code is accepted."
              : "Use the operations account. Password checks happen on the server."}
          </p>

          {challengeId ? (
            <form key="otp" className="mt-6 grid gap-4" onSubmit={(event) => void onCode(event)} noValidate>
              <FormField label="Authentication code" htmlFor="otp" error={codeError ?? undefined}>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  aria-invalid={Boolean(codeError)}
                  aria-describedby={codeError ? "otp-error" : undefined}
                  className="font-mono text-lg tracking-[0.4em]"
                />
              </FormField>
              <Button type="submit" loading={submitting} className="w-full">
                Continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setChallengeId(null);
                  setCode("");
                  setCodeError(null);
                }}
              >
                Use a different account
              </Button>
            </form>
          ) : (
            <form key="credentials" className="mt-6 grid gap-4" onSubmit={form.handleSubmit(onCredentials)} noValidate>
              <FormField label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                  {...form.register("email")}
                />
              </FormField>
              <FormField label="Password" htmlFor="password" error={form.formState.errors.password?.message}>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={Boolean(form.formState.errors.password)}
                    aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                    className="pr-10"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center text-muted-foreground"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormField>
              <Button type="submit" loading={submitting} className="w-full">
                Continue
              </Button>
            </form>
          )}

          {hint.data ? (
            <aside className="mt-6 rounded-md border border-border bg-muted/70 p-3 text-xs">
              <p className="font-medium text-foreground">Development fixture</p>
              <p className="mt-1 text-muted-foreground">{hint.data.note}</p>
              <dl className="mt-3 grid gap-1 font-mono text-[12px]">
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Email</dt><dd>{hint.data.email}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Password</dt><dd>{hint.data.password}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-muted-foreground">2FA</dt><dd>{hint.data.otp}</dd></div>
              </dl>
            </aside>
          ) : null}
        </div>
      </section>
    </div>
  );
}
