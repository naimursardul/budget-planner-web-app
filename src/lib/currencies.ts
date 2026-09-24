export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "US Dollar ($)", symbol: "$" },
  { code: "EUR", label: "Euro (€)", symbol: "€" },
  { code: "GBP", label: "British Pound (£)", symbol: "£" },
  { code: "CAD", label: "Canadian Dollar (CA$)", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
  { code: "BDT", label: "Bangladeshi Taka (৳)", symbol: "৳" },
  { code: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { code: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
];

export const DEFAULT_CURRENCY = "USD";

export function isSupportedCurrency(code: string): boolean {
  return CURRENCIES.some((c) => c.code === code);
}

/** Short symbol for inline input prefixes — read off the one currency list. */
export function currencySymbolFor(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export const ACCOUNTS = ["Main", "Checking", "Savings", "Cash", "Credit Card"] as const;
export type AccountName = (typeof ACCOUNTS)[number];
