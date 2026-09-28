import { OPERATIONS_LOCALE, OPERATIONS_TIME_ZONE } from "@/config/locale";

export const CURRENCY_CODES = ["INR"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export type Money = {
  amountMinor: number;
  currency: CurrencyCode;
};

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: "₹",
};

export function formatShare(shareBps: number): string {
  const major = Math.trunc(shareBps / 100);
  const minor = String(Math.abs(shareBps % 100)).padStart(2, "0");
  return `${major}.${minor}`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat(OPERATIONS_LOCALE, { maximumFractionDigits: 0 }).format(value);
}

export function formatMoney(
  money: Money,
  options?: { signDisplay?: "auto" | "always" },
): string {
  const negative = money.amountMinor < 0;
  const absolute = Math.abs(money.amountMinor);
  const major = Math.trunc(absolute / 100);
  const minor = String(absolute % 100).padStart(2, "0");
  const grouped = new Intl.NumberFormat(OPERATIONS_LOCALE, {
    maximumFractionDigits: 0,
  }).format(major);
  const symbol = CURRENCY_SYMBOLS[money.currency];
  const sign = negative ? "-" : options?.signDisplay === "always" ? "+" : "";
  return `${sign}${symbol}${grouped}.${minor}`;
}

export function formatChartDay(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Intl.DateTimeFormat(OPERATIONS_LOCALE, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(OPERATIONS_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: OPERATIONS_TIME_ZONE,
  }).format(new Date(iso));
}

/** Elapsed label between two service timestamps. Display only. */
export function formatElapsed(fromIso: string, toIso: string): string {
  const minutes = Math.max(0, Math.trunc((Date.parse(toIso) - Date.parse(fromIso)) / 60_000));
  if (!Number.isFinite(minutes)) return "—";
  if (minutes < 1) return "Started just now";
  if (minutes < 60) return `Started ${minutes}m ago`;
  const hours = Math.trunc(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `Started ${hours}h ago` : `Started ${hours}h ${rest}m ago`;
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(OPERATIONS_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: OPERATIONS_TIME_ZONE,
  }).format(new Date(iso));
}

/** Visual axis scale only. Not a balance, payout, or total. */
export function minorToChartUnits(amountMinor: number): number {
  return Math.trunc(amountMinor / 100);
}

/** Compact chart-axis label for rupee major units. Display only. */
export function formatAxisRupees(major: number): string {
  const sign = major < 0 ? "-" : "";
  const absolute = Math.abs(Math.trunc(major));
  if (absolute >= 10_000_000) {
    const crore = Math.trunc(absolute / 10_000_000);
    const tenth = Math.trunc((absolute % 10_000_000) / 1_000_000);
    return tenth === 0 ? `${sign}${crore} Cr` : `${sign}${crore}.${tenth} Cr`;
  }
  if (absolute >= 100_000) {
    const lakh = Math.trunc(absolute / 100_000);
    const tenth = Math.trunc((absolute % 100_000) / 10_000);
    return tenth === 0 ? `${sign}${lakh}L` : `${sign}${lakh}.${tenth}L`;
  }
  return `${sign}${formatCount(absolute)}`;
}
