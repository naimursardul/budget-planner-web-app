import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MoneyProps {
  value: number;
  currency: string;
  className?: string;
  /** Show + sign for positive values (for deltas). */
  signed?: boolean;
  /** Force 2 decimals for exact money contexts. */
  precise?: boolean;
}

export function Money({ value, currency, className, signed, precise }: MoneyProps) {
  const formatted = formatNumber(
    precise ? Number(value.toFixed(2)) : value,
    currency
  );
  const sign = signed && value > 0 ? "+" : "";
  return (
    <span className={cn("tabular-nums", className)}>
      {sign}
      {formatted}
    </span>
  );
}
