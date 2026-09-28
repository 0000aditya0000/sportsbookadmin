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
import type { AgentListItem } from "@/lib/validation/agents";

export function AgentRowMenu({
  agent,
  onEdit,
  onStatus,
}: {
  agent: AgentListItem;
  onEdit: (agent: AgentListItem) => void;
  onStatus: (agent: AgentListItem, action: "suspend" | "activate") => void;
}) {
  const canEdit = usePermission(PERMISSIONS.AGENT_EDIT);
  const canViewUsers = usePermission(PERMISSIONS.USER_VIEW);
  const canViewReports = usePermission(PERMISSIONS.REPORT_VIEW);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${agent.name}`}>
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/agents/${agent.id}`}>View agent</Link>
        </DropdownMenuItem>
        {canEdit ? <DropdownMenuItem onSelect={() => onEdit(agent)}>Edit agent</DropdownMenuItem> : null}
        {canViewUsers ? (
          <DropdownMenuItem asChild>
            <Link href={`/agents/${agent.id}?tab=users`}>View users</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href={`/agents/${agent.id}?tab=bets`}>View bets</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/agents/${agent.id}?tab=transactions`}>View transactions</Link>
        </DropdownMenuItem>
        {canViewReports ? (
          <DropdownMenuItem asChild>
            <Link href={`/agents/${agent.id}?tab=reports`}>View reports</Link>
          </DropdownMenuItem>
        ) : null}
        {canEdit ? <DropdownMenuSeparator /> : null}
        {canEdit && agent.status === "active" ? (
          <DropdownMenuItem className="text-destructive" onSelect={() => onStatus(agent, "suspend")}>
            Suspend agent
          </DropdownMenuItem>
        ) : null}
        {canEdit && agent.status !== "active" ? (
          <DropdownMenuItem onSelect={() => onStatus(agent, "activate")}>Activate agent</DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
