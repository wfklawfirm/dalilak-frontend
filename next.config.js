/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dalilak-backend-bvb9.onrender.com',
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          // batch #511: HSTS is zero-risk to add (Vercel already serves the
          // whole site over HTTPS only) — it just instructs the browser to
          // never attempt a plain-HTTP request to this origin again, closing
          // a downgrade-attack window on the user's first visit. Not adding
          // a Content-Security-Policy here: the app relies on inline <style>
          // tags in dozens of components for keyframe animations, so a CSP
          // strict enough to be worth adding would need either
          // 'unsafe-inline' (defeats most of the point) or a nonce-based
          // middleware setup — that's a dedicated audit, not a drive-by header.
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ]
  },

  images: {
    formats: ['image/webp'],
  },
}

module.exports = nextConfig
