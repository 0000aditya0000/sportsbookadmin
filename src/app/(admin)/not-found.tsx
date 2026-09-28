import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-10">
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        That route is not registered in the operations console.
      </p>
      <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium underline">
        Back to dashboard
      </Link>
    </div>
  );
}
