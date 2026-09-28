export function OddsDisplay({ odds }: { odds: string }) {
  return <span className="font-mono text-[13px] tabular-nums">{odds || "—"}</span>;
}
