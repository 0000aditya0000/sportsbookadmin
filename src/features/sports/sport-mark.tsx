export function SportMark({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden
      className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-accent text-[11px] font-semibold tracking-wide text-sidebar-accent-foreground"
    >
      {initials || "SP"}
    </span>
  );
}
