"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Menu, Moon, PanelLeft, Search, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { NotificationMenu } from "@/features/notifications/notification-menu";
import { ProfileMenu } from "@/features/auth/profile-menu";
import { useRealtime } from "@/components/providers/realtime-provider";
import { useSession } from "@/components/providers/session-provider";
import { ConnectionStatus } from "@/components/display/status-indicators";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { breadcrumbsFor } from "@/config/routes";
import { getDashboard } from "@/lib/api/dashboard";
import { cn } from "@/lib/utils";

const headerQuery = {
  range: "14d" as const,
  page: 1,
  pageSize: 6,
  q: "",
  status: "all" as const,
  sort: "placedAt" as const,
  dir: "desc" as const,
};

export function Header({
  collapsed,
  onToggleSidebar,
  onOpenMobile,
  onOpenSearch,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
  onOpenSearch: () => void;
}) {
  const pathname = usePathname();
  const crumbs = breadcrumbsFor(pathname);
  const realtime = useRealtime();
  const session = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const health = useQuery({
    queryKey: ["dashboard-health"],
    queryFn: () => getDashboard(headerQuery),
    staleTime: 30_000,
  });

  const provider = health.data?.snapshot.health.provider;
  const liveTone =
    realtime.status === "connected" ? "success" : realtime.status === "stale" || realtime.status === "reconnecting" ? "warning" : "danger";
  const liveValue =
    realtime.status === "connected"
      ? "Active"
      : realtime.status === "reconnecting"
        ? "Reconnecting"
        : realtime.status === "stale"
          ? "Stale"
          : realtime.status === "connecting"
            ? "Connecting"
            : "Offline";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-card/95 px-3 backdrop-blur sm:px-4">
      <button type="button" className="grid size-9 place-items-center rounded-md hover:bg-muted lg:hidden" onClick={onOpenMobile} aria-label="Open navigation">
        <Menu className="size-4" />
      </button>
      <button
        type="button"
        className="hidden size-9 place-items-center rounded-md hover:bg-muted lg:grid"
        onClick={onToggleSidebar}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={collapsed}
      >
        <PanelLeft className="size-4" />
      </button>
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex items-center gap-1 text-sm">
          {crumbs.map((crumb, index) => {
            const current = index === crumbs.length - 1;
            return (
              <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1">
                {index > 0 ? <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" /> : null}
                {crumb.href && !current ? (
                  <Link href={crumb.href} className="truncate text-muted-foreground hover:text-foreground">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cn("truncate", current ? "font-medium" : "text-muted-foreground")}>{crumb.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <button
        type="button"
        onClick={onOpenSearch}
        className="hidden h-9 items-center gap-2 rounded-md border border-border bg-muted/60 px-3 text-sm text-muted-foreground hover:bg-muted lg:flex lg:w-56 xl:w-72"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search</span>
        <Kbd>Ctrl K</Kbd>
      </button>
      <button type="button" className="grid size-9 place-items-center rounded-md hover:bg-muted lg:hidden" onClick={onOpenSearch} aria-label="Search">
        <Search className="size-4" />
      </button>
      <div className="hidden items-center gap-4 border-l border-border pl-3 xl:flex">
        <ConnectionStatus
          label="Provider"
          value={provider ? provider.status === "connected" ? "Connected" : provider.status : "Checking"}
          tone={provider?.status === "connected" ? "success" : "warning"}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <ConnectionStatus label="Live" value={liveValue} tone={liveTone} pulse={realtime.status === "connected"} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {realtime.transport === "mock"
              ? "Development mock connection. No provider socket is configured."
              : "Backend WebSocket"}
          </TooltipContent>
        </Tooltip>
        {session.status === "ready" && session.admin.twoFactorEnabled ? (
          <ConnectionStatus label="Security" value="2FA" tone="success" />
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        <NotificationMenu />
        <button
          type="button"
          className="grid size-9 place-items-center rounded-md hover:bg-muted"
          aria-label="Toggle color theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Sun className="hidden size-4 dark:block" />
          <Moon className="size-4 dark:hidden" />
        </button>
        <ProfileMenu />
      </div>
    </header>
  );
}
