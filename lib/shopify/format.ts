import type { Money } from "./types";

/** Format a Shopify Money object as a localized currency string. */
export function formatMoney(money?: Money | null): string {
  if (!money) return "—";
  const amount = Number.parseFloat(money.amount);
  if (Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currencyCode,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${money.currencyCode} ${amount.toFixed(2)}`;
  }
}
