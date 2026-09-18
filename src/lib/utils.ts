export { cn } from "cn";

/** Format a price in the brand's convention: `₹ 12,500`. */
export function formatPrice(amount: number, currency = "INR"): string {
  if (currency === "INR") {
    return `₹ ${amount.toLocaleString("en-IN")}`;
  }
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
