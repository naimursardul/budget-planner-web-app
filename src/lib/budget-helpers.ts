import { formatPercent, isValidMonthKey, parseMonthKey } from "@/lib/utils";

export { formatPercent, isValidMonthKey, parseMonthKey };

/** Short currency symbol for inline input prefixes. */
export function currencySymbolFor(currency: string): string {
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "BDT":
      return "৳";
    case "INR":
      return "₹";
    case "JPY":
      return "¥";
    case "CAD":
      return "CA$";
    case "AUD":
      return "A$";
    default:
      return "$";
  }
}
