import type { Metadata } from 'next'
import { PROCEDURES_DATA } from '@/lib/procedures'
import ProcedureDetailClient from './ProcedureDetailClient'
import { notFound } from 'next/navigation'
import { buildBreadcrumbJsonLd, SITE_URL } from '@/lib/breadcrumbJsonLd'
import { ARCHIVE_DOCS, type ArchiveDoc } from '@/lib/archiveDocuments'

// batch #518: this matching used to run inside ProcedureDetailClient.tsx (a
// 'use client' component), which meant importing the *entire* ARCHIVE_DOCS
// array (7.9MB source, 5,234 documents) into the browser bundle just to
// filter it down to <=5 results — the reason procedures/[slug] pages were
// shipping ~804kB of First Load JS, by far the heaviest route in the app.
// page.tsx is a Server Component: this import and computation happen at
// build time / on the server only. Only the tiny filtered result (<=5
// small objects) crosses the server/client boundary as a prop — identical
// matching logic and output as before, just computed in the right place.
const FORM_KEYWORDS = ['نموذج', 'طلب', 'استمارة', 'form', 'application']
function findRelatedArchiveDocs(proc: (typeof PROCEDURES_DATA)[number]): ArchiveDoc[] {
  const needle = `${proc.authority?.ministry_en || ''} ${proc.authority?.name_en || ''}`.trim().toLowerCase()
  if (!needle) return []
  const matchedInstitutions = new Set<string>()
  for (const d of ARCHIVE_DOCS) {
    const inst = d.institution.toLowerCase()
    if (inst.length >= 4 && needle.includes(inst)) matchedInstitutions.add(d.institution)
  }
  if (matchedInstitutions.size === 0) return []
  const candidates = ARCHIVE_DOCS.filter(d => matchedInstitutions.has(d.institution))
  const isForm = (d: ArchiveDoc) => FORM_KEYWORDS.some(k => d.title.toLowerCase().includes(k))
  return [...candidates].sort((a, b) => Number(isForm(b)) - Number(isForm(a))).slice(0, 5)
}

// ── Static params ──────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return PROCEDURES_DATA.map(p => ({ slug: p.slug }))
}

// ── SEO metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const proc = PROCEDURES_DATA.find(p => p.slug === params.slug)
  if (!proc) return { title: 'إجراء — دليلك' }

  const title = `${proc.title_ar} — دليلك`
  const desc = proc.description_ar || `تعرّف على خطوات ${proc.title_ar} في لبنان، المستندات المطلوبة والرسوم.`
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      siteName: 'دليلك',
      locale: 'ar_LB',
    },
    alternates: {
      canonical: `/procedures/${params.slug}`,
    },
  }
}

// ── Structured data (JSON-LD) ────────────────────────────────────────────────
// Invisible to users — helps search engines show rich results (steps,
// required documents) for procedure pages. Built only from real fields
// already present in PROCEDURES_DATA; no invented content. Purely additive:
// does not touch any existing metadata, route, or visible UI.
function buildHowToJsonLd(proc: (typeof PROCEDURES_DATA)[number]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: proc.title_ar,
    description: proc.description_ar,
    inLanguage: 'ar',
    ...(proc.authority?.ministry_ar ? { provider: { '@type': 'GovernmentOrganization', name: proc.authority.ministry_ar } } : {}),
    step: (proc.steps || []).map(s => ({
      '@type': 'HowToStep',
      position: s.step,
      name: s.title_ar,
      ...(s.description_ar ? { text: s.description_ar } : {}),
    })),
  }
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProcedurePage({ params }: { params: { slug: string } }) {
  const proc = PROCEDURES_DATA.find(p => p.slug === params.slug)
  if (!proc) notFound()
  const breadcrumbLd = buildBreadcrumbJsonLd([
    { name: 'الرئيسية', url: SITE_URL },
    { name: 'الإجراءات', url: `${SITE_URL}/procedures` },
    { name: proc.title_ar, url: `${SITE_URL}/procedures/${proc.slug}` },
  ])
  const relatedArchiveDocs = findRelatedArchiveDocs(proc)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHowToJsonLd(proc)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProcedureDetailClient relatedArchiveDocs={relatedArchiveDocs} />
    </>
  )
}
