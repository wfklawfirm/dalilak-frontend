// Shared helper for BreadcrumbList structured data (schema.org) — used by
// server page.tsx wrappers (procedures/[slug], forms/[slug], ...) alongside
// the existing HowTo JSON-LD. Invisible to users, helps search engines show
// the page's position in the site hierarchy in results. Built only from
// real route paths + real titles already used elsewhere on each page —
// no invented content.

export const SITE_URL = 'https://dalilak-frontend.vercel.app'

export interface BreadcrumbLdItem {
  name: string
  url: string
}

export function buildBreadcrumbJsonLd(items: BreadcrumbLdItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
