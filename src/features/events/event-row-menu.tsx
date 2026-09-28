"use client";

import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { EventListItem } from "@/lib/validation/events";

export function EventRowMenu({
  event,
  onQuickView,
}: {
  event: EventListItem;
  onQuickView: (event: EventListItem) => void;
}) {
  const canView = usePermission(PERMISSIONS.EVENT_VIEW);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${event.name}`}>
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canView ? (
          <DropdownMenuItem asChild>
            <Link href={`/events/${event.id}`}>View event</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem onSelect={() => onQuickView(event)}>Quick view</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
