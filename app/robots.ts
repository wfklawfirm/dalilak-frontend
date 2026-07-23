import type { MetadataRoute } from 'next'

/**
 * robots.ts — standard Next.js metadata route, served at /robots.txt.
 * Was missing entirely (only sitemap.ts existed) — search engines had no
 * explicit crawl policy or sitemap pointer. Purely additive: does not touch
 * any existing page metadata, does not change any route, does not affect
 * analytics or auth.
 *
 * Allows all public content pages; disallows the admin dashboard and
 * account/auth flows (login, password reset) which have no SEO value and
 * shouldn't be indexed.
 */

const BASE = 'https://dalilak-frontend.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/forgot-password', '/reset-password'],
    },
    sitemap: `${BASE}/sitemap.xml`,
  }
}
