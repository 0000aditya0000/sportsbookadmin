"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/components/providers/session-provider";
import { MoneyDisplay } from "@/components/display/money-display";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, QueryFailure } from "@/components/states/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ReferralUserDrawer } from "@/features/referrals/referral-user-drawer";
import { ReferralUserStatusBadge } from "@/features/referrals/referral-status-badges";
import { getReferralTree, listReferralUsers } from "@/lib/api/referrals";
import { formatDateTime } from "@/lib/format";

export function ReferralTreeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canViewUser = usePermission(PERMISSIONS.USER_VIEW);
  const canViewAgent = usePermission(PERMISSIONS.AGENT_VIEW);
  const userId = searchParams.get("userId") ?? "";
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const suggestions = useQuery({
    queryKey: ["referrals", "tree-search", debounced],
    queryFn: () =>
      listReferralUsers({
        page: 1,
        pageSize: 8,
        q: debounced,
        referrer: "all",
        agent: "all",
        level: "all",
        source: "all",
        status: "all",
        registered: "all",
        sort: "displayName",
        direction: "asc",
      }),
    enabled: debounced.length >= 2,
  });

  const treeQuery = useQuery({
    queryKey: ["referrals", "tree", userId],
    queryFn: () => getReferralTree(userId),
    enabled: userId.length > 0,
  });
  const tree = treeQuery.data?.data;

  function selectUser(nextUserId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("userId", nextUserId);
    router.replace(`/referrals/tree?${params.toString()}`, { scroll: false });
    setSearch("");
    setDebounced("");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Referral Tree"
        description="Inspect the six-level referral hierarchy for a selected user."
        meta={
          tree ? (
            <span className="font-mono">
              Snapshot {formatDateTime(tree.generatedAt)} · {tree.source}
            </span>
          ) : null
        }
      />

      <div className="rounded-md border border-border bg-card p-4">
        <label htmlFor="tree-search" className="text-[13px] font-medium">
          Find user
        </label>
        <Input
          id="tree-search"
          className="mt-1.5"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by user id, name, phone, or referral code"
          aria-label="Search referral tree root"
        />
        {debounced.length >= 2 ? (
          <ul className="mt-2 divide-y divide-border rounded-md border border-border">
            {(suggestions.data?.data.items ?? []).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted/40"
                  onClick={() => selectUser(item.id)}
                >
                  <span>
                    <span className="font-medium">{item.displayName}</span>
                    <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                      {item.id} · {item.referralCode}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground">Select</span>
                </button>
              </li>
            ))}
            {suggestions.isSuccess && suggestions.data.data.items.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">No matching referral users.</li>
            ) : null}
          </ul>
        ) : null}
      </div>

      {!userId ? (
        <EmptyState title="Select a user" description="Search for a user to inspect their six-level referral network." />
      ) : null}

      {userId && treeQuery.isError && !tree ? (
        <QueryFailure
          error={treeQuery.error}
          onRetry={() => void treeQuery.refetch()}
          fallback="You don't have permission to view this referral data."
        />
      ) : null}

      {userId && !tree && treeQuery.isLoading ? <Skeleton className="h-72 w-full" /> : null}

      {tree ? (
        <>
          {tree.source === "mock" ? (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
              <Badge>Development</Badge>
              <span>Tree depth is capped at six levels by the service. Direct referrer and agent owner remain separate.</span>
            </div>
          ) : null}

          <section className="overflow-hidden rounded-md border border-border bg-card" aria-label="Selected user">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">{tree.root.displayName}</h2>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{tree.root.userId}</p>
            </div>
            <dl className="grid gap-0 sm:grid-cols-2">
              <div className="flex justify-between gap-4 border-b border-border px-4 py-2.5 text-sm">
                <dt className="text-muted-foreground">Referral code</dt>
                <dd className="font-mono text-[12px]">{tree.root.referralCode}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border px-4 py-2.5 text-sm">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <ReferralUserStatusBadge status={tree.root.status} />
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border px-4 py-2.5 text-sm">
                <dt className="text-muted-foreground">Direct referrer</dt>
                <dd>
                  {tree.root.directReferrerId && tree.root.directReferrerName
                    ? canViewUser
                      ? (
                          <Link href={`/users/${tree.root.directReferrerId}?tab=referrals`} className="hover:underline">
                            {tree.root.directReferrerName}
                          </Link>
                        )
                      : tree.root.directReferrerName
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border px-4 py-2.5 text-sm">
                <dt className="text-muted-foreground">Agent owner</dt>
                <dd>
                  {canViewAgent ? (
                    <Link href={`/agents/${tree.root.agentOwnerId}?tab=referrals`} className="hover:underline">
                      {tree.root.agentOwnerName}
                    </Link>
                  ) : (
                    tree.root.agentOwnerName
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4 px-4 py-2.5 text-sm sm:col-span-2">
                <dt className="text-muted-foreground">Registration</dt>
                <dd className="font-mono text-[12px]">{formatDateTime(tree.root.registeredAt)}</dd>
              </div>
            </dl>
          </section>

          {tree.levels.every((level) => level.nodes.length === 0) ? (
            <EmptyState title="No referral network found for this user" description="This user has no downline within six levels." />
          ) : (
            <div className="grid gap-3">
              {tree.levels.map((level) => (
                <section key={level.level} className="overflow-hidden rounded-md border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                    <h3 className="text-sm font-semibold">Level {level.level}</h3>
                    <span className="text-xs text-muted-foreground">{level.nodes.length} users</span>
                  </div>
                  {level.nodes.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-muted-foreground">No users at this level.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {level.nodes.map((node) => (
                        <li key={node.userId} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <button
                              type="button"
                              className="text-left font-medium hover:underline"
                              onClick={() => setDrawerUserId(node.userId)}
                            >
                              {node.displayName}
                            </button>
                            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                              {node.userId} · {node.referralCode}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Direct referrer: {node.directReferrerName ?? "—"} · Agent owner: {node.agentOwnerName}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <ReferralUserStatusBadge status={node.status} />
                            <MoneyDisplay money={node.commissionGenerated} />
                            <Button variant="outline" size="sm" onClick={() => selectUser(node.userId)}>
                              Focus
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </>
      ) : null}

      {drawerUserId ? (
        <ReferralUserDrawer userId={drawerUserId} onOpenChange={(open) => !open && setDrawerUserId(null)} />
      ) : null}
    </div>
  );
}
