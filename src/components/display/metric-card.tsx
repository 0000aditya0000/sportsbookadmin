import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <article className="bg-card px-4 py-4">
      <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <div className="mt-2">{value}</div>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </article>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className={cn("bg-card px-4 py-3")}>
      <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-sans text-lg font-semibold tabular-nums tracking-tight">{value}</p>
      {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
    </article>
  );
}
