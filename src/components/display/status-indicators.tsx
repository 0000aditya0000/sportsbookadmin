import { cn } from "@/lib/utils";

const dotTones = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
  live: "bg-live",
  neutral: "bg-muted-foreground",
} as const;

export function ConnectionStatus({
  label,
  value,
  tone,
  pulse = false,
}: {
  label: string;
  value: string;
  tone: keyof typeof dotTones;
  pulse?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("size-1.5 rounded-full", dotTones[tone], pulse && "live-dot")} aria-hidden />
      <span className="font-medium">{value}</span>
    </span>
  );
}

export function RealtimeIndicator({
  label,
  live,
}: {
  label: string;
  live: boolean;
}) {
  return (
    <ConnectionStatus
      label={label}
      value={live ? "Active" : "Idle"}
      tone={live ? "live" : "neutral"}
      pulse={live}
    />
  );
}
