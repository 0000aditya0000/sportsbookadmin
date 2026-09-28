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
import type { WithdrawalListItem, WithdrawalStatusChange } from "@/lib/validation/withdrawals";

export function WithdrawalRowMenu({
  withdrawal,
  onStatus,
}: {
  withdrawal: WithdrawalListItem;
  onStatus: (withdrawal: WithdrawalListItem, action: WithdrawalStatusChange["action"]) => void;
}) {
  const canView = usePermission(PERMISSIONS.WITHDRAWAL_VIEW);
  const canApprove = usePermission(PERMISSIONS.WITHDRAWAL_APPROVE);
  const canReject = usePermission(PERMISSIONS.WITHDRAWAL_REJECT);
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const pending = withdrawal.status === "pending";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${withdrawal.id}`}>
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canView ? (
          <DropdownMenuItem asChild>
            <Link href={`/withdrawals/${withdrawal.id}`}>View withdrawal</Link>
          </DropdownMenuItem>
        ) : null}
        {canViewUser ? (
          <DropdownMenuItem asChild>
            <Link href={`/users/${withdrawal.userId}?tab=transactions`}>Open user</Link>
          </DropdownMenuItem>
        ) : null}
        {pending && (canApprove || canReject) ? <DropdownMenuSeparator /> : null}
        {pending && canApprove ? (
          <DropdownMenuItem onSelect={() => onStatus(withdrawal, "approve")}>Approve</DropdownMenuItem>
        ) : null}
        {pending && canReject ? (
          <DropdownMenuItem onSelect={() => onStatus(withdrawal, "reject")}>Reject</DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
