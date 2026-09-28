import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-md">
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Meridian</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">That address is not part of the operations console.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium underline">
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
