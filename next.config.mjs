/** @type {import('next').NextConfig} */

/**
 * Applied to every response.
 *
 * Deliberately no `script-src`/`default-src`: a strict script CSP needs
 * per-request nonces threaded through the proxy and every inline script, and
 * getting it wrong white-screens the site. The directives below are the ones
 * that cost nothing to enable — none of them affect script or style loading.
 */
const securityHeaders = [
  // Clickjacking. `frame-ancestors` is the modern form; X-Frame-Options stays
  // for older browsers that ignore CSP.
  {
    key: "Content-Security-Policy",
    value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stops a browser from MIME-sniffing an upload into something executable.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Cross-origin requests send only the origin, never the full path+query.
  // This is also what keeps the PayU redirect's query string out of referrers.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Two years. `includeSubDomains` is left off on purpose — it would also
  // force HTTPS on every subdomain, which is not ours to assume.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000",
  },
];

const nextConfig = {
  experimental: {
    serverActions: {
      // Server Actions carry uploaded file bytes in the request body. The
      // 1 MB default rejects multi-image uploads (and any single large photo)
      // before the action runs. Files are capped at 10 MB server-side.
      bodySizeLimit: "15mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // The admin panel has no reason to be framed by anyone, including us.
        source: "/admin/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'",
          },
          { key: "X-Frame-Options", value: "DENY" },
          // Keep admin pages out of every cache, shared or private.
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
