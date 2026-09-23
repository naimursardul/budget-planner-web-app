import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Round to 2 decimal places (avoids float drift in money math). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatNumber(value: number, currency: string): string {
  const locale = currencyLocale(currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export function currencyLocale(currency: string): string {
  switch (currency) {
    case "USD":
      return "en-US";
    case "EUR":
      return "de-DE";
    case "GBP":
      return "en-GB";
    case "CAD":
      return "en-CA";
    case "AUD":
      return "en-AU";
    case "BDT":
      return "bn-BD";
    case "INR":
      return "en-IN";
    case "JPY":
      return "ja-JP";
    default:
      return "en-US";
  }
}

export function formatDate(
  date: Date | string,
  format: "MM/DD/YYYY" | "DD/MM/YYYY" = "MM/DD/YYYY"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return format === "DD/MM/YYYY" ? `${dd}/${mm}/${yyyy}` : `${mm}/${dd}/${yyyy}`;
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

/** Month key helpers — "YYYY-MM" is the canonical month identifier app-wide. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function parseMonthKey(key: string): { year: number; month: number } {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  return { year: y, month: m };
}

export function addMonths(key: string, delta: number): string {
  const { year, month } = parseMonthKey(key);
  const d = new Date(year, month - 1 + delta, 1);
  return monthKey(d);
}

/** Type guard — narrows `key` to a valid "YYYY-MM" string. */
export function isValidMonthKey(key: string | null | undefined): key is string {
  return !!key && /^\d{4}-(0[1-9]|1[0-2])$/.test(key);
}

/** Month start/end boundaries in UTC-safe local Date objects. */
export function monthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(key: string): string {
  const { year, month } = parseMonthKey(key);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function trendDirection(current: number, previous: number): "up" | "down" | "flat" {
  if (previous === 0) return current > 0 ? "up" : "flat";
  const diff = (current - previous) / Math.abs(previous);
  if (diff > 0.005) return "up";
  if (diff < -0.005) return "down";
  return "flat";
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return round2(((current - previous) / Math.abs(previous)) * 100);
}
