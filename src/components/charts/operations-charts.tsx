"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MoneyDisplay } from "@/components/display/money-display";
import { formatAxisRupees, formatChartDay, formatCount, minorToChartUnits, type Money } from "@/lib/format";

type Point = {
  date: string;
  turnover: Money;
  ggr: Money;
  deposits: Money;
  withdrawals: Money;
  bets: number;
};

function chartRows(series: Point[]) {
  return series.map((point) => ({
    label: formatChartDay(point.date),
    turnover: minorToChartUnits(point.turnover.amountMinor),
    ggr: minorToChartUnits(point.ggr.amountMinor),
    deposits: minorToChartUnits(point.deposits.amountMinor),
    withdrawals: minorToChartUnits(point.withdrawals.amountMinor),
    bets: point.bets,
    turnoverMoney: point.turnover,
    ggrMoney: point.ggr,
    depositsMoney: point.deposits,
    withdrawalsMoney: point.withdrawals,
  }));
}

export function TurnoverChart({ series }: { series: Point[] }) {
  const rows = chartRows(series);
  const peak = Math.max(...rows.map((row) => row.bets), 1);

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={(value: number) => formatAxisRupees(value)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload as (typeof rows)[number] | undefined;
                if (!row) return null;
                return (
                  <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-card)]">
                    <p className="mb-1 font-medium">{row.label}</p>
                    <p>Turnover <MoneyDisplay money={row.turnoverMoney} /></p>
                    <p>GGR <MoneyDisplay money={row.ggrMoney} tone="signed" /></p>
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="turnover" name="Turnover" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.12} strokeWidth={1.75} />
            <Area type="monotone" dataKey="ggr" name="GGR" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.08} strokeWidth={1.75} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4 px-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-1" /> Turnover</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-2" /> GGR</span>
      </div>
      <div className="mt-4 px-2">
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">Bet volume</p>
        <div className="mt-2 flex h-10 items-end gap-1" aria-hidden>
          {rows.map((row) => (
            <div key={row.label} className="flex-1 rounded-sm bg-chart-5/70" style={{ height: `${(row.bets / peak) * 100}%` }} title={`${row.label}: ${formatCount(row.bets)}`} />
          ))}
        </div>
      </div>
      <table className="sr-only">
        <caption>Turnover, GGR, and bet volume</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Turnover</th>
            <th>GGR</th>
            <th>Bets</th>
          </tr>
        </thead>
        <tbody>
          {series.map((point) => (
            <tr key={point.date}>
              <td>{point.date}</td>
              <td>{point.turnover.amountMinor}</td>
              <td>{point.ggr.amountMinor}</td>
              <td>{point.bets}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CashflowChart({ series }: { series: Point[] }) {
  const rows = chartRows(series);
  return (
    <div>
      <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(value: number) => formatAxisRupees(value)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as (typeof rows)[number] | undefined;
              if (!row) return null;
              return (
                <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-card)]">
                  <p className="mb-1 font-medium">{row.label}</p>
                  <p>Deposits <MoneyDisplay money={row.depositsMoney} /></p>
                  <p>Withdrawals <MoneyDisplay money={row.withdrawalsMoney} /></p>
                </div>
              );
            }}
          />
          <Bar dataKey="deposits" fill="var(--chart-3)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="withdrawals" fill="var(--chart-4)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4 px-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-3" /> Deposits</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-chart-4" /> Withdrawals</span>
      </div>
    </div>
  );
}
