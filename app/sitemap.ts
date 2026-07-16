import type { MetadataRoute } from 'next'
import { PROCEDURES_DATA, FORMS_DATA } from '@/lib/procedures'

const BASE = 'https://dalilak-frontend.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    // Core pages
    { url: `${BASE}/`,               lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/services`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.95 },
    { url: `${BASE}/procedures`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/forms`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.85 },
    { url: `${BASE}/authorities`,    lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/faq`,            lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${BASE}/drafting-studio`,lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    // Procedure detail pages — auto-synced from PROCEDURES_DATA
    ...PROCEDURES_DATA.map(p => ({
      url: `${BASE}/procedures/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // Form detail pages — auto-synced from FORMS_DATA
    ...FORMS_DATA.map(f => ({
      url: `${BASE}/forms/${f.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
