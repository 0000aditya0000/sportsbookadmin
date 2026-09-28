import Link from "next/link";
import { CopyButton } from "@/components/display/copy-button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/states/feedback-states";
import { Button } from "@/components/ui/button";
import type { AppRoute } from "@/config/routes";

export function ModulePlaceholder({
  route,
  params,
}: {
  route: AppRoute;
  params: Record<string, string>;
}) {
  const recordId = Object.values(params)[0];

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader title={route.title} description={route.description} />
      <section className="overflow-hidden rounded-md border border-border bg-card shadow-[var(--shadow-card)]">
        <EmptyState
          title="Not in this release"
          description="This module is on the operations map. Screens, actions, and figures will be connected when the backend contract for it exists. Nothing here changes balances, bets, or permissions."
        />
        {recordId ? (
          <p className="flex items-center gap-1 px-4 pb-4 font-mono text-xs text-muted-foreground">
            Identifier {recordId}
            <CopyButton value={recordId} label="Copy identifier" />
          </p>
        ) : null}
        {route.links && route.links.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
            {route.links.map((link) => (
              <Button key={link.href} asChild variant="outline" size="sm">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
