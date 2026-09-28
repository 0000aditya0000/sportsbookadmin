"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/providers/session-provider";
import { isNavItemActive, navigation } from "@/config/navigation";
import { can } from "@/config/permissions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const session = useSession();

  return (
    <nav aria-label="Primary" className="ops-scroll flex-1 overflow-y-auto px-2 py-3">
      <div className="grid gap-5">
        {navigation.map((group) => {
          const items = group.items.filter((item) => {
            if (!item.permission || session.status !== "ready") return true;
            return can(session.permissions, item.permission);
          });
          if (items.length === 0) return null;
          return (
            <section key={group.label} className="grid gap-1">
              {collapsed ? (
                <span className="sr-only">{group.label}</span>
              ) : (
                <h2 className="px-2.5 pb-1 text-[11px] font-medium tracking-[0.14em] text-sidebar-muted uppercase">
                  {group.label}
                </h2>
              )}
              <ul className="grid gap-0.5">
                {items.map((item) => {
                  const active = isNavItemActive(pathname, item.href);
                  const Icon = item.icon;
                  const link = (
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                      className={cn(
                        "flex h-9 items-center gap-2.5 rounded-md text-[13px] text-sidebar-foreground",
                        collapsed ? "justify-center px-0" : "px-2.5",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/70",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", active ? "text-sidebar-primary" : "text-sidebar-muted")} />
                      {collapsed ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </nav>
  );
}
