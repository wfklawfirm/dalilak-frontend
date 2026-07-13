import type { MetadataRoute } from 'next'

const BASE = 'https://dalilak-frontend.vercel.app'

const PROCEDURE_SLUGS = [
  'passport', 'civil-registry-extract', 'birth-certificate', 'company-registration',
  'building-permit', 'property-transfer', 'driver-license', 'social-security',
  'document-attestation', 'inheritance-certificate', 'criminal-record',
  'marriage-registration', 'death-registration', 'tax-registration',
  'power-of-attorney', 'commercial-registry', 'municipality-permit',
]

const FORM_SLUGS = [
  'passport-application', 'id-card-application', 'property-transfer-form',
  'company-registration-sal', 'nssf-registration', 'building-permit-form', 'nssf-medical-claim',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/procedures`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/forms`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...PROCEDURE_SLUGS.map(slug => ({
      url: `${BASE}/procedures/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...FORM_SLUGS.map(slug => ({
      url: `${BASE}/forms/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
