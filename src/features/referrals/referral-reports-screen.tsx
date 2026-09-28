"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MetricCard } from "@/components/display/metric-card";
import { MoneyDisplay } from "@/components/display/money-display";
import { PageHeader } from "@/components/layout/page-header";
import { QueryFailure } from "@/components/states/feedback-states";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { getReferralReports } from "@/lib/api/referrals";
import { formatCount, formatDateTime } from "@/lib/format";
import type { ReferralReportQuery } from "@/lib/validation/referrals";

function oneOf<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function ReferralReportsScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const created = oneOf(searchParams.get("created"), ["all", "7d", "30d", "90d"] as const, "30d");
  const level = oneOf(searchParams.get("level"), ["all", "1", "2", "3", "4", "5", "6"] as const, "all");
  const status = oneOf(
    searchParams.get("status"),
    ["all", "pending", "posted", "reversed", "failed"] as const,
    "all",
  );
  const agent = searchParams.get("agent") ?? "all";

  const filters: ReferralReportQuery = { created, agent, level, status };

  function update(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const query = useQuery({
    queryKey: ["referral-reports", filters],
    queryFn: () => getReferralReports(filters),
  });
  const report = query.data?.data;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
      <PageHeader
        title="Referral Reports"
        description="Aggregated referral commission and registration statistics from the service."
        meta={
          report ? (
            <span className="font-mono">
              Snapshot {formatDateTime(report.generatedAt)} · {report.source}
            </span>
          ) : null
        }
      />

      {report?.source === "mock" ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Badge>Development</Badge>
          <span>Report totals are backend aggregations. They are not calculated from the current page rows.</span>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Combobox
          label="Period"
          value={created}
          options={[
            { value: "all", label: "All time" },
            { value: "7d", label: "7 days" },
            { value: "30d", label: "30 days" },
            { value: "90d", label: "90 days" },
          ]}
          onChange={(value) => update({ created: value === "30d" ? null : value })}
        />
        <Combobox
          label="Level"
          value={level}
          options={[
            { value: "all", label: "All levels" },
            { value: "1", label: "Level 1" },
            { value: "2", label: "Level 2" },
            { value: "3", label: "Level 3" },
            { value: "4", label: "Level 4" },
            { value: "5", label: "Level 5" },
            { value: "6", label: "Level 6" },
          ]}
          onChange={(value) => update({ level: value === "all" ? null : value })}
        />
        <Combobox
          label="Status"
          value={status}
          options={[
            { value: "all", label: "Any" },
            { value: "pending", label: "Pending" },
            { value: "posted", label: "Posted" },
            { value: "reversed", label: "Reversed" },
            { value: "failed", label: "Failed" },
          ]}
          onChange={(value) => update({ status: value === "all" ? null : value })}
        />
      </div>

      {query.isError && !report ? (
        <QueryFailure error={query.error} onRetry={() => void query.refetch()} fallback="Referral reports could not be loaded." />
      ) : null}
      {!report && query.isLoading ? <Skeleton className="h-72 w-full" /> : null}

      {report ? (
        <>
          <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3" aria-label="Report totals">
            <MetricCard
              label="Commission amount"
              value={<MoneyDisplay money={report.totals.commissionAmount} display="kpi" />}
              hint="Service aggregation"
            />
            <MetricCard
              label="Posted amount"
              value={<MoneyDisplay money={report.totals.postedAmount} display="kpi" />}
              hint="Service aggregation"
            />
            <MetricCard
              label="Pending amount"
              value={<MoneyDisplay money={report.totals.pendingAmount} display="kpi" />}
              hint="Service aggregation"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Commission by level</h2>
              </div>
              {report.byLevel.map((row) => (
                <div
                  key={row.level}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0"
                >
                  <span>Level {row.level}</span>
                  <span className="tabular-nums text-muted-foreground">{formatCount(row.commissions)}</span>
                  <MoneyDisplay money={row.amount} />
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Commission by status</h2>
              </div>
              {report.byStatus.map((row) => (
                <div
                  key={row.status}
                  className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0"
                >
                  <span className="uppercase">{row.status}</span>
                  <span className="tabular-nums text-muted-foreground">{formatCount(row.count)}</span>
                  <MoneyDisplay money={row.amount} />
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2" aria-label="Registration statistics">
            <MetricCard
              label="Agent-acquired users"
              value={
                <span className="text-xl font-semibold tabular-nums">
                  {formatCount(report.registrationStats.agentAcquired)}
                </span>
              }
            />
            <MetricCard
              label="User-referral acquisitions"
              value={
                <span className="text-xl font-semibold tabular-nums">
                  {formatCount(report.registrationStats.userReferral)}
                </span>
              }
            />
          </section>
        </>
      ) : null}
    </div>
  );
}
