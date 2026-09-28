import type { Money } from "@/lib/format";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MoneyDisplay({
  money,
  tone = "neutral",
  display = "table",
  className,
}: {
  money: Money;
  tone?: "neutral" | "signed";
  display?: "table" | "kpi";
  className?: string;
}) {
  const positive = money.amountMinor > 0;
  const negative = money.amountMinor < 0;
  const color =
    tone === "signed" && positive
      ? "text-positive"
      : tone === "signed" && negative
        ? "text-negative"
        : "text-foreground";

  return (
    <span
      className={cn(
        "whitespace-nowrap tabular-nums",
        display === "kpi"
          ? "font-sans text-xl font-semibold tracking-tight sm:text-2xl"
          : "font-mono text-[13px]",
        color,
        className,
      )}
    >
      {formatMoney(money, { signDisplay: tone === "signed" && positive ? "always" : "auto" })}
    </span>
  );
}
