import { createHash } from "node:crypto";
import { paymentConfig } from "./config";
import type {
  PaymentGateway,
  CreateOrderInput,
  CreateOrderResult,
  VerifyPaymentInput,
  VerifyPaymentResult,
  WebhookResult,
} from "./types";

/**
 * Generate the PayU hash string.
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt)
 */
function generateHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
}): string {
  const hashString = [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    "", // udf1
    "", // udf2
    "", // udf3
    "", // udf4
    "", // udf5
    "", // udf6
    "", // udf7
    "", // udf8
    "", // udf9
    "", // udf10
    params.salt,
  ].join("|");

  return createHash("sha512").update(hashString).digest("hex");
}

/**
 * Verify the response hash from PayU.
 * Reverse hash: sha512(salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
function verifyResponseHash(params: {
  salt: string;
  status: string;
  email: string;
  firstname: string;
  productinfo: string;
  amount: string;
  txnid: string;
  key: string;
  hash: string;
}): boolean {
  const reverseHashString = [
    params.salt,
    params.status,
    "", // udf10
    "", // udf9
    "", // udf8
    "", // udf7
    "", // udf6
    "", // udf5
    "", // udf4
    "", // udf3
    "", // udf2
    "", // udf1
    params.email,
    params.firstname,
    params.productinfo,
    params.amount,
    params.txnid,
    params.key,
  ].join("|");

  const computed = createHash("sha512")
    .update(reverseHashString)
    .digest("hex");
  return computed === params.hash;
}

export class PayUGateway implements PaymentGateway {
  readonly name = "payu";

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const { merchantKey, merchantSalt } = paymentConfig.payu;
    if (!merchantKey || !merchantSalt) {
      throw new Error("PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT are required");
    }

    const amountInRupees = (input.amount.amount / 100).toFixed(2);
    const email = input.customer.email || "customer@zorael.co";
    const phone = input.customer.phone || "";

    const hash = generateHash({
      key: merchantKey,
      txnid: input.orderId,
      amount: amountInRupees,
      productinfo: "ZORAEL & CO. Order",
      firstname: input.customer.name,
      email,
      salt: merchantSalt,
    });

    const surl = `${getAppBaseUrl()}/api/checkout/payu/callback`;
    const furl = `${getAppBaseUrl()}/api/checkout/payu/callback`;

    const formParams = new URLSearchParams({
      key: merchantKey,
      txnid: input.orderId,
      amount: amountInRupees,
      productinfo: "ZORAEL & CO. Order",
      firstname: input.customer.name,
      email,
      phone,
      surl,
      furl,
      hash,
      service_provider: "payu_paisa",
    });

    // PayU requires a form POST. We redirect to an intermediate page
    // that auto-submits the form to PayU.
    const redirectUrl = `${getAppBaseUrl()}/api/checkout/payu/redirect?${formParams.toString()}`;

    return {
      providerOrderId: input.orderId,
      amount: input.amount,
      provider: "payu",
      redirectUrl,
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    // PayU verification is done in the callback route via response hash.
    // This method handles the case where verify is called with the hash as signature.
    const { merchantKey, merchantSalt } = paymentConfig.payu;

    if (!input.signature) {
      return {
        verified: false,
        providerPaymentId: input.providerPaymentId,
        reason: "missing_hash",
      };
    }

    // The signature contains the serialized verification data
    try {
      const data = JSON.parse(input.signature) as {
        status: string;
        email: string;
        firstname: string;
        productinfo: string;
        amount: string;
        hash: string;
      };

      const verified = verifyResponseHash({
        salt: merchantSalt,
        status: data.status,
        email: data.email,
        firstname: data.firstname,
        productinfo: data.productinfo,
        amount: data.amount,
        txnid: input.orderId,
        key: merchantKey,
        hash: data.hash,
      });

      return {
        verified,
        providerPaymentId: input.providerPaymentId,
        reason: verified ? undefined : "hash_mismatch",
      };
    } catch {
      return {
        verified: false,
        providerPaymentId: input.providerPaymentId,
        reason: "invalid_signature_data",
      };
    }
  }

  async handleWebhook(
    _rawBody: string,
    _headers: Headers,
  ): Promise<WebhookResult> {
    // PayU doesn't use webhooks in the redirect flow — callbacks handle it.
    return { received: true };
  }
}

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}
