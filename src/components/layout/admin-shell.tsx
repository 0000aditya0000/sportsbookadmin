"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Header } from "@/components/layout/header";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { CommandPalette } from "@/features/search/command-palette";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AdminShell({
  children,
  initialCollapsed = false,
}: {
  children: React.ReactNode;
  initialCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `meridian_sidebar=${next ? "collapsed" : "expanded"}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  return (
    <SessionProvider>
      <RealtimeProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
          >
            Skip to content
          </a>
          <aside
            className={cn(
              "hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex",
              collapsed ? "w-[72px]" : "w-[248px]",
            )}
          >
            <div className={cn("flex h-14 items-center gap-2.5 border-b border-sidebar-border", collapsed ? "justify-center px-2" : "px-3")}>
              <BrandMark />
              {collapsed ? null : (
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold tracking-tight text-sidebar-accent-foreground">Meridian</span>
                  <span className="block truncate text-[11px] text-sidebar-muted">Super Admin</span>
                </span>
              )}
            </div>
            <SidebarNav collapsed={collapsed} />
            <div className={cn("border-t border-sidebar-border px-3 py-3", collapsed && "px-2")}>
              <p className={cn("text-[11px] text-sidebar-muted", collapsed && "sr-only")}>Development · Mock data</p>
              {collapsed ? <span className="mx-auto block size-1.5 rounded-full bg-sidebar-primary" aria-hidden /> : null}
            </div>
          </aside>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent aria-describedby={undefined}>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">Primary platform navigation</SheetDescription>
              <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3">
                <BrandMark />
                <span>
                  <span className="block text-sm font-semibold text-sidebar-accent-foreground">Meridian</span>
                  <span className="block text-[11px] text-sidebar-muted">Super Admin</span>
                </span>
              </div>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 flex-1 flex-col">
            <Header
              collapsed={collapsed}
              onToggleSidebar={toggleSidebar}
              onOpenMobile={() => setMobileOpen(true)}
              onOpenSearch={() => setSearchOpen(true)}
            />
            <main id="main-content" className="ops-scroll flex-1 overflow-y-auto px-4 py-5 lg:px-6">
              {children}
            </main>
          </div>
        </div>
        <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      </RealtimeProvider>
    </SessionProvider>
  );
}
