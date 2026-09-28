"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CopyButton } from "@/components/display/copy-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { listNotifications } from "@/lib/api/notifications";
import { formatDateTime } from "@/lib/format";
import type { AppNotification } from "@/lib/validation/notifications";

const tone = {
  info: "info",
  warning: "warning",
  critical: "danger",
} as const;

export function NotificationMenu() {
  const [selected, setSelected] = useState<AppNotification | null>(null);
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });
  const items = query.data?.items ?? [];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Notifications, ${items.length} items`}>
            <Bell className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-0">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-sm font-medium">Notifications</p>
            <Link href="/notifications" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <ul className="ops-scroll max-h-96 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="grid w-full gap-1 border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-muted"
                  onClick={() => setSelected(item)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{item.title}</span>
                    <StatusBadge tone={tone[item.severity]}>{item.severity}</StatusBadge>
                  </span>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{item.body}</span>
                </button>
              </li>
            ))}
            {items.length === 0 ? <li className="px-3 py-6 text-sm text-muted-foreground">No notifications.</li> : null}
          </ul>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected ? (
            <>
              <div className="flex items-center gap-2">
                <StatusBadge tone={tone[selected.severity]}>{selected.severity}</StatusBadge>
                <DialogTitle className="text-base">{selected.title}</DialogTitle>
              </div>
              <DialogDescription className="mt-3 text-sm text-foreground">{selected.body}</DialogDescription>
              <dl className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between gap-3">
                  <dt>Time</dt>
                  <dd className="font-mono">{formatDateTime(selected.at)}</dd>
                </div>
                {selected.reference ? (
                  <div className="flex items-center justify-between gap-3">
                    <dt>Reference</dt>
                    <dd className="flex items-center gap-1 font-mono">
                      {selected.reference}
                      <CopyButton value={selected.reference} />
                    </dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
