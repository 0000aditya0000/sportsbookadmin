"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { TransactionListItem } from "@/lib/validation/transactions";

export function TransactionRowMenu({ transaction }: { transaction: TransactionListItem }) {
  const canView = usePermission(PERMISSIONS.TRANSACTION_VIEW);
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${transaction.id}`}>
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canView ? (
          <DropdownMenuItem asChild>
            <Link href={`/transactions/${transaction.id}`}>View transaction</Link>
          </DropdownMenuItem>
        ) : null}
        {canViewUser ? (
          <DropdownMenuItem asChild>
            <Link href={`/users/${transaction.userId}?tab=transactions`}>Open user</Link>
          </DropdownMenuItem>
        ) : null}
        {canViewAgent ? (
          <DropdownMenuItem asChild>
            <Link href={`/agents/${transaction.agentId}`}>Open agent</Link>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
