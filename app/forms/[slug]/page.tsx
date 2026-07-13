import type { Metadata } from 'next'
import { FORMS_DATA } from '@/lib/procedures'
import FormDetailClient from './FormDetailClient'
import { notFound } from 'next/navigation'

// ── Static params ─────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  return FORMS_DATA.map(f => ({ slug: f.slug }))
}

// ── SEO metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const form = FORMS_DATA.find(f => f.slug === params.slug)
  if (!form) return { title: 'نموذج — دليلك AI' }

  const title = `${form.title_ar} — دليلك AI`
  const desc = `تنزيل نموذج ${form.title_ar} من ${form.authority_ar}. ${form.category_ar}. دليلك للمعاملات الحكومية اللبنانية.`
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      siteName: 'دليلك AI',
      locale: 'ar_LB',
    },
    alternates: {
      canonical: `/forms/${params.slug}`,
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function FormDetailPage({ params }: { params: { slug: string } }) {
  const form = FORMS_DATA.find(f => f.slug === params.slug)
  if (!form) notFound()
  return <FormDetailClient form={form!} />
}
