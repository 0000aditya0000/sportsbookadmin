import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary text-[#04211e]", className)}>
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
        <path
          fill="currentColor"
          d="M1.5 13V3h2.3l4.2 6.1L12.2 3H14.5v10h-1.9V6.8L9.2 13H6.8L3.4 6.8V13H1.5z"
        />
      </svg>
    </span>
  );
}
