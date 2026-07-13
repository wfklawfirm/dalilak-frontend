/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com',
  },

  async headers() {
    return [
      {
        // Apply to every route (pages, API routes, static assets)
        source: "/(.*)",
        headers: [
          // Blocks MIME-sniffing attacks — safe to add unconditionally.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Full URL same-origin, origin-only cross-origin, nothing on downgrade.
          // Modern browser default; does not break OAuth redirects or API calls.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // DENY: Dalilak AI is a standalone citizen-facing app with no embedding
          // use-case.  Change to SAMEORIGIN only with a documented ADR.
          // The CSP equivalent (frame-ancestors 'none') will be added with CSP
          // in a future gate.
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
