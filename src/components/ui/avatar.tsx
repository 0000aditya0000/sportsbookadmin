import { cn } from "@/lib/utils";

export function UserAvatar({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const initials = label
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 place-items-center rounded-full bg-sidebar-accent text-[11px] font-semibold tracking-wide text-sidebar-accent-foreground",
        className,
      )}
    >
      {initials || "SA"}
    </span>
  );
}
