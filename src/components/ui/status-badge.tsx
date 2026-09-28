import { cn } from "@/lib/utils";

const tones = {
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  danger: "bg-danger-muted text-destructive",
  info: "bg-info-muted text-info",
  neutral: "bg-muted text-muted-foreground",
  live: "bg-live-muted text-live",
} as const;

export function StatusBadge({
  tone,
  pulse = false,
  className,
  children,
}: {
  tone: keyof typeof tones;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {pulse ? <span aria-hidden className="live-dot size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}
