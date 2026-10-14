import { NextResponse } from "next/server";
import { getGateway } from "@/lib/payments";
import { getOrderStore } from "@/lib/orders/store";
import { decrementStock } from "@/lib/inventory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PayU redirects the user here (POST) after payment — both success and failure.
 * We verify the response hash, update the order, and redirect to the appropriate page.
 */
export async function POST(request: Request) {
  const formData = await request.formData();

  const txnid = formData.get("txnid") as string | null;
  const status = formData.get("status") as string | null;
  const hash = formData.get("hash") as string | null;
  const mihpayid = formData.get("mihpayid") as string | null;
  const email = formData.get("email") as string | null;
  const firstname = formData.get("firstname") as string | null;
  const productinfo = formData.get("productinfo") as string | null;
  const amount = formData.get("amount") as string | null;

  const baseUrl = getAppBaseUrl();

  if (!txnid || !status || !hash) {
    return NextResponse.redirect(`${baseUrl}/checkout?error=invalid_response`, {
      status: 303,
    });
  }

  const store = getOrderStore();
  const order = await store.get(txnid);
  if (!order) {
    return NextResponse.redirect(`${baseUrl}/checkout?error=order_not_found`, {
      status: 303,
    });
  }

  // Payment failed at PayU
  if (status !== "success") {
    await store.update(txnid, { status: "failed" }, "payu-callback");
    return NextResponse.redirect(
      `${baseUrl}/checkout?error=payment_failed&orderId=${txnid}`,
      { status: 303 },
    );
  }

  // Verify the hash using the gateway's verifyPayment
  const gateway = getGateway();
  const signatureData = JSON.stringify({
    status,
    email: email ?? "",
    firstname: firstname ?? "",
    productinfo: productinfo ?? "",
    amount: amount ?? "",
    hash,
  });

  const result = await gateway.verifyPayment({
    orderId: txnid,
    providerOrderId: txnid,
    providerPaymentId: mihpayid ?? "",
    signature: signatureData,
  });

  if (!result.verified) {
    await store.update(txnid, { status: "failed" }, "payu-callback");
    return NextResponse.redirect(
      `${baseUrl}/checkout?error=verification_failed&orderId=${txnid}`,
      { status: 303 },
    );
  }

  const previousStatus = order.status;
  await store.update(
    txnid,
    {
      status: "paid",
      providerPaymentId: mihpayid ?? undefined,
    },
    "payu-callback",
  );

  // Decrement stock on first successful payment
  if (previousStatus !== "paid" && order.method !== "cod") {
    await decrementStock(
      order.cart.lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        size: l.size,
        color: l.color,
      })),
    );
  }

  return NextResponse.redirect(
    `${baseUrl}/checkout/success?orderId=${txnid}`,
    { status: 303 },
  );
}

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}
