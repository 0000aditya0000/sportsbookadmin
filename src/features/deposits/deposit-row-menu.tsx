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
import type { DepositListItem, DepositStatusChange } from "@/lib/validation/deposits";

export function DepositRowMenu({
  deposit,
  onStatus,
}: {
  deposit: DepositListItem;
  onStatus: (deposit: DepositListItem, action: DepositStatusChange["action"]) => void;
}) {
  const canView = usePermission(PERMISSIONS.DEPOSIT_VIEW);
  const canApprove = usePermission(PERMISSIONS.DEPOSIT_APPROVE);
  const canReject = usePermission(PERMISSIONS.DEPOSIT_REJECT);
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const pending = deposit.status === "pending";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${deposit.id}`}>
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canView ? (
          <DropdownMenuItem asChild>
            <Link href={`/deposits/${deposit.id}`}>View deposit</Link>
          </DropdownMenuItem>
        ) : null}
        {canViewUser ? (
          <DropdownMenuItem asChild>
            <Link href={`/users/${deposit.userId}?tab=transactions`}>Open user</Link>
          </DropdownMenuItem>
        ) : null}
        {pending && (canApprove || canReject) ? <DropdownMenuSeparator /> : null}
        {pending && canApprove ? (
          <DropdownMenuItem onSelect={() => onStatus(deposit, "approve")}>Approve</DropdownMenuItem>
        ) : null}
        {pending && canReject ? (
          <DropdownMenuItem onSelect={() => onStatus(deposit, "reject")}>Reject</DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
