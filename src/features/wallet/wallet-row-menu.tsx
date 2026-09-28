"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { WalletListItem } from "@/lib/validation/wallet";

export function WalletRowMenu({ account }: { account: WalletListItem }) {
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);

  const ownerHref =
    account.ownerType === "user"
      ? `/users/${account.ownerId}?tab=wallet`
      : account.ownerType === "agent"
        ? `/agents/${account.ownerId}?tab=wallet`
        : null;

  const canOpenOwner =
    (account.ownerType === "user" && canViewUser) || (account.ownerType === "agent" && canViewAgent);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${account.walletId}`}>
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canOpenOwner && ownerHref ? (
          <DropdownMenuItem asChild>
            <Link href={ownerHref}>Open owner wallet</Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>Owner wallet unavailable</DropdownMenuItem>
        )}
        {account.ownerType === "user" && canViewAgent && account.agentId ? (
          <DropdownMenuItem asChild>
            <Link href={`/agents/${account.agentId}?tab=wallet`}>Open agent</Link>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
