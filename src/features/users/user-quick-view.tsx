"use client";

import Link from "next/link";
import { MoneyDisplay } from "@/components/display/money-display";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { UserAvatar } from "@/components/ui/avatar";
import { UserStatusBadge } from "@/features/users/user-status-badge";
import { formatDateTime } from "@/lib/format";
import type { UserListItem } from "@/lib/validation/users";

export function UserQuickView({
  user,
  onOpenChange,
}: {
  user: UserListItem;
  onOpenChange: (open: boolean) => void;
}) {
  const rows = [
    ["Agent", `${user.agentName} · ${user.agentId}`],
    ["Balance", null],
    ["Open bets", String(user.openBets)],
    ["Last login", user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—"],
  ] as const;

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="left-auto right-0 w-[min(100%,24rem)] bg-card text-foreground">
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <UserAvatar label={user.displayName} />
          <div className="min-w-0">
            <SheetTitle className="truncate text-base font-semibold">{user.displayName}</SheetTitle>
            <SheetDescription className="font-mono text-xs">{user.id}</SheetDescription>
          </div>
          <UserStatusBadge status={user.status} />
        </div>
        <dl className="divide-y divide-border">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium">
                {label === "Balance" ? <MoneyDisplay money={user.balance} /> : value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex gap-2 border-t border-border p-4">
          <Button asChild>
            <Link href={`/users/${user.id}`}>View user</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/users/${user.id}?tab=sessions`}>View sessions</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
