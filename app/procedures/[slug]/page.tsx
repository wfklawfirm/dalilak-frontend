import type { Metadata } from 'next'
import { PROCEDURES_DATA } from '@/lib/procedures'
import ProcedureDetailClient from './ProcedureDetailClient'
import { notFound } from 'next/navigation'

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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHowToJsonLd(proc)) }}
      />
      <ProcedureDetailClient />
    </>
  )
}
