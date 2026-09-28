"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { EventStatusBadge } from "@/features/events/event-status-badge";
import { formatDateTime, formatElapsed } from "@/lib/format";
import type { EventListItem } from "@/lib/validation/events";

export function EventQuickView({
  event,
  asOf,
  onOpenChange,
}: {
  event: EventListItem;
  asOf: string;
  onOpenChange: (open: boolean) => void;
}) {
  const rows = [
    ["Competition", event.competitionName],
    ["Sport", event.sportName],
    ["Start", formatDateTime(event.startTime)],
    ["Provider", `${event.providerName} · ${event.providerEventId}`],
  ] as const;

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="left-auto right-0 w-[min(100%,24rem)] bg-card text-foreground">
        <div className="flex items-start gap-3 border-b border-border px-4 py-4">
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-base font-semibold">{event.name}</SheetTitle>
            <SheetDescription className="font-mono text-xs">{event.id}</SheetDescription>
            {event.status === "live" ? (
              <p className="mt-1 text-xs text-muted-foreground">{formatElapsed(event.startTime, asOf)}</p>
            ) : null}
          </div>
          <EventStatusBadge status={event.status} />
        </div>
        <dl className="divide-y divide-border">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto border-t border-border p-4">
          <Button asChild>
            <Link href={`/events/${event.id}`}>Open event</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
