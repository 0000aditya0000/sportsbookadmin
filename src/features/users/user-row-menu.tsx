"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserListItem, UserStatusChange } from "@/lib/validation/users";

export function UserRowMenu({
  user,
  onQuickView,
  onStatus,
  onLogout,
}: {
  user: UserListItem;
  onQuickView: (user: UserListItem) => void;
  onStatus: (user: UserListItem, action: UserStatusChange["action"]) => void;
  onLogout: (user: UserListItem) => void;
}) {
  const canView = usePermission(PERMISSIONS.USER_VIEW);
  const canSuspend = usePermission(PERMISSIONS.USER_SUSPEND);
  const canBan = usePermission(PERMISSIONS.USER_BAN);
  const canRevoke = usePermission(PERMISSIONS.USER_SESSION_REVOKE);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${user.displayName}`}>
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canView ? (
          <DropdownMenuItem asChild>
            <Link href={`/users/${user.id}`}>View user</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={() => onQuickView(user)}>Quick view</DropdownMenuItem>
        {canView ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}?tab=wallet`}>View wallet</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}?tab=bets`}>View bets</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}?tab=transactions`}>View transactions</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}?tab=sessions`}>View sessions</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/users/${user.id}?tab=activity`}>View activity</Link>
            </DropdownMenuItem>
          </>
        ) : null}
        {canSuspend && user.status === "active" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onStatus(user, "suspend")}>Suspend</DropdownMenuItem>
          </>
        ) : null}
        {canSuspend && user.status === "suspended" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onStatus(user, "activate")}>Activate</DropdownMenuItem>
          </>
        ) : null}
        {canSuspend && user.status === "locked" ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onStatus(user, "unlock")}>Unlock</DropdownMenuItem>
          </>
        ) : null}
        {canBan && (user.status === "active" || user.status === "suspended") ? (
          <DropdownMenuItem onSelect={() => onStatus(user, "ban")}>Ban</DropdownMenuItem>
        ) : null}
        {canRevoke && user.activeSessionId ? (
          <DropdownMenuItem onSelect={() => onLogout(user)}>Logout user</DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
