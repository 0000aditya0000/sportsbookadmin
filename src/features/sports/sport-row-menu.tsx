"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { SportListItem } from "@/lib/validation/sports";

export function SportRowMenu({ sport }: { sport: SportListItem }) {
  const canView = usePermission(PERMISSIONS.SPORT_VIEW);
  const canViewEvents = usePermission(PERMISSIONS.EVENT_VIEW);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${sport.name}`}>
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canView ? (
          <DropdownMenuItem asChild>
            <Link href={`/sports/${sport.id}`}>View sport</Link>
          </DropdownMenuItem>
        ) : null}
        {canViewEvents ? (
          <DropdownMenuItem asChild>
            <Link href={`/events?sport=${sport.id}`}>View events</Link>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
