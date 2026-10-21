import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // Checked on the server so the page never renders for a guest. The cart
  // lives in the browser, so nothing is lost across the redirect.
  const session = await getSession();
  if (!session) {
    redirect("/account/login?next=/checkout&reason=checkout");
  }

  return <CheckoutView />;
}
