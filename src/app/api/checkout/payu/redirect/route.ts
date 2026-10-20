import { NextResponse } from "next/server";
import { paymentConfig } from "@/lib/payments/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REQUIRED_FIELDS = [
  "key",
  "txnid",
  "amount",
  "productinfo",
  "firstname",
  "email",
  "phone",
  "surl",
  "furl",
  "hash",
] as const;

/**
 * Intermediate redirect page: renders an auto-submitting form that POSTs
 * to PayU's payment page. This is necessary because PayU requires a form POST
 * (not a GET redirect).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const params: Record<string, string> = {};

  for (const field of REQUIRED_FIELDS) {
    const value = url.searchParams.get(field);
    if (!value) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 },
      );
    }
    params[field] = value;
  }

  // Optional fields
  const serviceProvider = url.searchParams.get("service_provider");
  if (serviceProvider) params.service_provider = serviceProvider;

  // Verify the txnid key matches our configured merchant key
  if (params.key !== paymentConfig.payu.merchantKey) {
    return NextResponse.json({ error: "Invalid request" }, { status: 403 });
  }

  const payuUrl = getPayUBaseUrl();

  const hiddenFields = Object.entries(params)
    .map(
      ([k, v]) =>
        `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}" />`,
    )
    .join("\n      ");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redirecting to payment...</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F5F1E8;
      font-family: system-ui, sans-serif;
      color: #171613;
    }
    .loader {
      text-align: center;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 2px solid #D8CFBF;
      border-top-color: #171613;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    p { font-size: 14px; opacity: 0.6; }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <p>Redirecting to payment gateway&hellip;</p>
  </div>
  <form id="payuForm" method="POST" action="${escapeHtml(payuUrl)}">
      ${hiddenFields}
  </form>
  <script>document.getElementById('payuForm').submit();</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Live vs test cannot be inferred from the merchant key — PayU issues
 * short keys for both. NODE_ENV decides, with PAYU_BASE_URL as an explicit
 * override for staging that must reach the live endpoint (or vice versa).
 */
function getPayUBaseUrl(): string {
  const override = process.env.PAYU_BASE_URL;
  if (override) return override;
  return process.env.NODE_ENV === "production"
    ? "https://secure.payu.in/_payment"
    : "https://test.payu.in/_payment";
}
