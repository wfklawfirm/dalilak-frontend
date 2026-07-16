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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ProcedurePage({ params }: { params: { slug: string } }) {
  const proc = PROCEDURES_DATA.find(p => p.slug === params.slug)
  if (!proc) notFound()
  return <ProcedureDetailClient />
}
